namespace CloudLearningTracker.API.Entities;

public class LearningTask
{
    public int TaskId { get; set; }

    public string TaskTitle { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int SubTopicId { get; set; }

    public int TaskStatusId { get; set; }

    public string? ResourceURL { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime? CompletedDate { get; set; }

    public DateTime? DueDate { get; set; }

    // Navigation Properties
    public SubTopic SubTopic { get; set; } = null!;

    public TaskStatus TaskStatus { get; set; } = null!;
}