namespace CloudLearningTracker.API.DTOs.Dashboard;
public class TopicProgressDto
{
    public int TopicId { get; set; }

    public string TopicName { get; set; } = string.Empty;

    public int TotalTasks { get; set; }

    public int CompletedTasks { get; set; }

    public double CompletionPercentage { get; set; }
}