
using CloudLearningTracker.API.Data;
using CloudLearningTracker.API.DTOs.SubTopic;
using CloudLearningTracker.API.Entities;
using CloudLearningTracker.API.Exceptions;
using CloudLearningTracker.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CloudLearningTracker.API.Services;

public class SubTopicService : ISubTopicService
{
    private readonly AppDbContext _context;
    private readonly ILogger<SubTopicService> _logger;
     public SubTopicService(AppDbContext context, ILogger<SubTopicService> logger)
    {
        _context = context;
        _logger = logger;
    }
    public async Task<int> CreateSubTopicAsync( CreateSubTopicDto request, int userId)
    {
        try
        {
            var topic = await _context.Topics
                            .AsNoTracking()
                                .FirstOrDefaultAsync(x =>
                                    x.TopicId == request.TopicId &&
                                    x.UserId == userId);

            if (topic == null)
            {
                throw new NotFoundException("Topic not found.");
            }

            var subTopic = new SubTopic
            {
                TopicId = request.TopicId,
                SubTopicName = request.SubTopicName.Trim(),
                Description = request.Description,
                CreatedDate = DateTime.UtcNow
            };

            _context.SubTopics.Add(subTopic);
            await _context.SaveChangesAsync();
            _logger.LogInformation("SubTopic created: {SubTopicName} for TopicId: {TopicName}", request.SubTopicName, topic.TopicName);

            return subTopic.SubTopicId;
        }
        catch (NotFoundException nf)
        {
            _logger.LogError(nf, "Failed to create subtopic for user {UserId}", userId);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create subtopic for user {UserId}", userId);
            throw;
        }    
    }

    public Task<List<SubTopicResponseDto>>  GetSubTopicsByTopicAsync( int topicId, int userId)
    {
        try
        {
            var topic = _context.Topics
                    .AsNoTracking()
                    .FirstOrDefault(x =>
                        x.TopicId == topicId &&
                        x.UserId == userId);

            if (topic == null)
            {
                throw new NotFoundException("Topic not found.");
            }

            return _context.SubTopics
                    .AsNoTracking()
                    .Where(x => x.TopicId == topicId)
                    .Select(x => new SubTopicResponseDto
                    {
                        SubTopicId = x.SubTopicId,
                        TopicId = x.TopicId,
                        SubTopicName = x.SubTopicName,
                        Description = x.Description,
                        CreatedDate = x.CreatedDate
                    })
                    .ToListAsync();
        }
        catch (NotFoundException nf)
        {
            _logger.LogError(nf, "Failed to fetch subtopics for topic {TopicId} and user {UserId}", topicId, userId);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch subtopics for topic {TopicId} and user {UserId}", topicId, userId);
            throw;
        }        
    }

    public async Task<SubTopicResponseDto> GetByIdAsync( int subTopicId, int userId)
    {
        try
        {
            var subTopic = await _context.SubTopics
                .AsNoTracking()
                .Where(x => x.SubTopicId == subTopicId
                    && x.Topic.UserId == userId)
                .Select(x => new SubTopicResponseDto
                {
                    SubTopicId = x.SubTopicId,
                    TopicId = x.TopicId,
                    SubTopicName = x.SubTopicName,
                    Description = x.Description,
                    CreatedDate = x.CreatedDate
                })
                .FirstOrDefaultAsync();

            if (subTopic == null)
            {
                throw new NotFoundException("SubTopic not found.");
            }

            return subTopic;
        }
        catch(NotFoundException nf)
        {
            _logger.LogError(nf, "Failed to fetch subtopic {SubTopicId} for user {UserId}", subTopicId, userId);
            throw;
        }
        catch(Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch subtopic {SubTopicId} for user {UserId}", subTopicId, userId);
            throw;
        }
    }

    public async Task UpdateAsync( int subTopicId, UpdateSubTopicDto request, int userId)
    {
        try
        {
            var subTopic = await _context.SubTopics
                        .FirstOrDefaultAsync(x => x.SubTopicId == subTopicId
                            && x.Topic.UserId == userId);

            if (subTopic == null)
            {
                throw new NotFoundException( "SubTopic not found.");
            }

            subTopic.SubTopicName = request.SubTopicName.Trim();
            subTopic.Description = request.Description;

            await _context.SaveChangesAsync();
            _logger.LogInformation("SubTopic updated: {SubTopicName}", request.SubTopicName);
        }
        catch(NotFoundException nf)
        {
            _logger.LogError(nf, "Failed to update subtopic {SubTopicId} for user {UserId}", subTopicId, userId);
            throw;
        }
        catch(Exception ex)
        {
            _logger.LogError(ex, "Failed to update subtopic {SubTopicId} for user {UserId}", subTopicId, userId);
            throw;
        }
    }

    public async Task DeleteAsync( int subTopicId, int userId)
    {
        try
        {
            var subTopic = await _context.SubTopics
                .FirstOrDefaultAsync(x => x.SubTopicId == subTopicId
                    && x.Topic.UserId == userId);

            if (subTopic == null)
            {
                throw new NotFoundException("SubTopic not found.");
            }

            _context.SubTopics.Remove(subTopic);
            await _context.SaveChangesAsync();
            _logger.LogInformation("SubTopic deleted: {SubTopicName}", subTopic.SubTopicName);
        }
        catch(NotFoundException nf)
        {
            _logger.LogError(nf, "Failed to delete subtopic {SubTopicId} for user {UserId}", subTopicId, userId);
            throw;
        }
        catch(Exception ex)
        {
            _logger.LogError(ex, "Failed to delete subtopic {SubTopicId} for user {UserId}", subTopicId, userId);
            throw;
        }
    }
 }