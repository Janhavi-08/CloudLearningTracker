namespace CloudLearningTracker.API.DTOs.Notes;
public class NoteResponseDto
{
    public int NoteId { get; set; }

    public string NoteTitle { get; set; } = string.Empty;

    public string? Content { get; set; }

    public string? ResourceURL { get; set; }

    public int SubTopicId { get; set; }

    public DateTime CreatedDate { get; set; }
}