namespace CloudLearningTracker.API.DTOs.Dashboard;

public class DueTaskDto
{
    public int TaskId { get; set; }

    public string TaskTitle { get; set; } = string.Empty;

    public DateTime? DueDate { get; set; }

    public string SubTopicName { get; set; } = string.Empty;

    public string? DueDays { get; set; }
}
