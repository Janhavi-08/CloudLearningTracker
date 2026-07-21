namespace CloudLearningTracker.API.DTOs.Dashboard;
public class DashboardProgressDto
{
    public int TotalTasks { get; set; }

    public int CompletedTasks { get; set; }

    public int InProgressTasks { get; set; }

    public int NotStartedTasks { get; set; }

    public double CompletionPercentage { get; set; }

    public int TotalSubtopics { get; set; }

    public int TotalNotes { get; set; }
}