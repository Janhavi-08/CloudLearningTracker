using CloudLearningTracker.API.Data;
using CloudLearningTracker.API.DTOs.Notes;
using CloudLearningTracker.API.Entities;
using CloudLearningTracker.API.Exceptions;
using CloudLearningTracker.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CloudLearningTracker.API.Services;

public class NoteService : INoteService
{
    private readonly AppDbContext _context;

    private readonly ILogger<NoteService> _logger;

    public NoteService(AppDbContext context, ILogger<NoteService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<int> CreateNoteAsync( CreateNoteDto request, int userId)
    {
        try
        {
            var subTopic = await _context.SubTopics
                                .FirstOrDefaultAsync(x =>
                                    x.SubTopicId == request.SubTopicId &&
                                    x.Topic.UserId == userId);

            if (subTopic == null)
            {
                throw new NotFoundException("SubTopic not found.");
            }

            var note = new Note
            {
                NoteTitle = request.NoteTitle.Trim(),
                Content = request.Content,
                ResourceURL = request.ResourceURL,
                SubTopicId = request.SubTopicId,
                CreatedDate = DateTime.UtcNow
            };

            _context.Notes.Add(note);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Note created: {NoteTitle}", request.NoteTitle.Trim());
            return note.NoteId;
        }
        catch (NotFoundException nf)
        {
            _logger.LogError(nf, "Failed to create note for user {UserId}", userId);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create note for user {UserId}", userId);
            throw;
        }
    }

    public async Task<List<NoteResponseDto>> GetNotesBySubTopicAsync( int subTopicId, int userId)
    {
        try
        {
            var subTopic = await _context.SubTopics
                .FirstOrDefaultAsync(x =>
                    x.SubTopicId == subTopicId &&
                    x.Topic.UserId == userId);

            if (subTopic == null)
            {
                throw new NotFoundException("SubTopic not found.");
            }

            return await _context.Notes
                .AsNoTracking()
                .Where(x => x.SubTopicId == subTopicId)
                .Select(x => new NoteResponseDto
                {
                    NoteId = x.NoteId,
                    NoteTitle = x.NoteTitle,
                    Content = x.Content,
                    ResourceURL = x.ResourceURL,
                    SubTopicId = x.SubTopicId,
                    CreatedDate = x.CreatedDate
                })
                .ToListAsync();
        }
         catch (NotFoundException nf)
        {
            _logger.LogError(nf, "Failed to fetch notes for user {UserId}", userId);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch notes for user {UserId}", userId);
            throw;
        }
    }

    public async Task<NoteResponseDto> GetNoteByIdAsync( int noteId, int userId)
    {
        try
        {
            var note = await _context.Notes
                    .AsNoTracking()
                    .Where(x =>
                        x.NoteId == noteId &&
                        x.SubTopic.Topic.UserId == userId)
                    .Select(x => new NoteResponseDto
                    {
                        NoteId = x.NoteId,
                        NoteTitle = x.NoteTitle,
                        Content = x.Content,
                        ResourceURL = x.ResourceURL,
                        SubTopicId = x.SubTopicId,
                        CreatedDate = x.CreatedDate
                    })
                    .FirstOrDefaultAsync();

            if (note == null)
            {
                throw new NotFoundException("Note not found.");
            }

            return note;
        }
        catch (NotFoundException nf)
        {
            _logger.LogError(nf, "Failed to fetch notes for user {UserId}", userId);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch notes for user {UserId}", userId);
            throw;
        }
    }

    public async Task UpdateNoteAsync( int noteId,  UpdateNoteDto request, int userId)
    {
        try
        {
            var note = await _context.Notes
                .FirstOrDefaultAsync(x =>
                    x.NoteId == noteId &&
                    x.SubTopic.Topic.UserId == userId);

            if (note == null)
            {
                throw new NotFoundException("Note not found.");
            }

            note.NoteTitle = request.NoteTitle.Trim();
            note.Content = request.Content;
            note.ResourceURL = request.ResourceURL;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Note updatd: {NoteTitle}", request.NoteTitle.Trim());

        }
            catch (NotFoundException nf)
        {
            _logger.LogError(nf, "Failed to updatd note for user {UserId}", userId);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to updatd note for user {UserId}", userId);
            throw;
        }
    }

    public async Task DeleteNoteAsync( int noteId, int userId)
    {
        try
        {
            var note = await _context.Notes
                .FirstOrDefaultAsync(x =>
                    x.NoteId == noteId &&
                    x.SubTopic.Topic.UserId == userId);

            if (note == null)
            {
                throw new NotFoundException("Note not found.");
            }

            _context.Notes.Remove(note);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Note delete: {NoteTitle}", note.NoteTitle.Trim());     
        }
            catch (NotFoundException nf)
        {
            _logger.LogError(nf, "Failed to delete note for user {UserId}", userId);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete note for user {UserId}", userId);
            throw;
        }
    }
    public async Task<List<NoteResponseDto>> SearchNotesAsync( string? keyword, int userId)
    {
        try
        {
            keyword = (keyword ?? string.Empty).Trim();

            return await _context.Notes
                    .AsNoTracking()
                    .Where(x =>
                        x.SubTopic.Topic.UserId ==
                            userId
                        &&
                        (
                            x.NoteTitle.Contains(
                                keyword)
                            ||
                            (x.Content != null
                            &&
                            x.Content.Contains(
                                keyword))
                        ))
                    .Select(x =>
                        new NoteResponseDto
                        {
                            NoteId = x.NoteId,
                            NoteTitle = x.NoteTitle,
                            Content = x.Content,
                            ResourceURL =
                                x.ResourceURL,
                            SubTopicId =
                                x.SubTopicId,
                            CreatedDate =
                                x.CreatedDate
                        }).Take(50)
                    .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch notes for user {UserId}", userId);
            throw;
        }

    }
    public async Task<List<NoteResponseDto>> GetNotesAsync(int userId)
    {
        try
        {
            return await _context.Notes
                .AsNoTracking()
                .Where(x => x.SubTopic.Topic.UserId == userId)
                .Select(x => new NoteResponseDto
                {
                    NoteId = x.NoteId,
                    NoteTitle = x.NoteTitle,
                    Content = x.Content,
                    ResourceURL = x.ResourceURL,
                    SubTopicId = x.SubTopicId,
                    CreatedDate = x.CreatedDate
                })
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch notes for user {UserId}", userId);
            throw;
        }
    }
}