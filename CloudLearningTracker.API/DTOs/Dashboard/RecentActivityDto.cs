namespace CloudLearningTracker.API.DTOs.Dashboard;

public class RecentActivityDto
{
    public string Type { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Detail { get; set; } = string.Empty;

    public DateTime? Time { get; set; }

    public string Tag { get; set; } = string.Empty;
}
