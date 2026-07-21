using CloudLearningTracker.API.DTOs.Notes;

namespace CloudLearningTracker.API.Services.Interfaces;

public interface INoteService
{
    Task<int> CreateNoteAsync(CreateNoteDto request, int userId);

    Task<List<NoteResponseDto>> GetNotesBySubTopicAsync(int subTopicId, int userId);

    Task<NoteResponseDto> GetNoteByIdAsync(int noteId, int userId);

    Task UpdateNoteAsync(int noteId, UpdateNoteDto request, int userId);

    Task DeleteNoteAsync(int noteId, int userId);
    
    Task<List<NoteResponseDto>> SearchNotesAsync(string? keyword, int userId);

    Task<List<NoteResponseDto>> GetNotesAsync(int userId);
}