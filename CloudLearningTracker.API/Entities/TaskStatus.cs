namespace CloudLearningTracker.API.Entities;

public class TaskStatus
{
    public int TaskStatusId { get; set; }

    public string StatusName { get; set; } = string.Empty;

    // Navigation Property
    public ICollection<LearningTask> Tasks { get; set; } = new List<LearningTask>();
}