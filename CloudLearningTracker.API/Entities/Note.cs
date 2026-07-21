namespace CloudLearningTracker.API.Entities;

public class Note
{
    public int NoteId { get; set; }

    public string NoteTitle { get; set; } = string.Empty;

    public string? Content { get; set; }

    public int SubTopicId { get; set; }

    public DateTime CreatedDate { get; set; }

    public string? ResourceURL { get; set; }

    // Navigation Property
    public SubTopic SubTopic { get; set; } = null!;
}