namespace CloudLearningTracker.API.DTOs.Task;

public class TaskResponseDto
{
    public int TaskId { get; set; }

    public string TaskTitle { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int TaskStatusId { get; set; }

    public string TaskStatus { get; set; } = string.Empty;

    public string? ResourceURL { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime? CompletedDate { get; set; }

    public DateTime? DueDate { get; set; }
public string TopicName { get; set; } = string.Empty;

public string SubTopicName { get; set; } = string.Empty;
}