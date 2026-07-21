namespace CloudLearningTracker.API.Entities;

public class SubTopic
{
    public int SubTopicId { get; set; }

    public string SubTopicName { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime CreatedDate { get; set; }

    public int TopicId { get; set; }

    // Navigation Properties
    public Topic Topic { get; set; } = null!;

    public ICollection<LearningTask> Tasks { get; set; } = new List<LearningTask>();

    public ICollection<Note> Notes { get; set; } = new List<Note>();
}