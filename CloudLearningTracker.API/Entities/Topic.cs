namespace CloudLearningTracker.API.Entities;

public class Topic
{
    public int TopicId { get; set; }

    public string TopicName { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime CreatedDate { get; set; }

    public int UserId { get; set; }

    // Navigation Properties
    public User User { get; set; } = null!;

    public ICollection<SubTopic> SubTopics { get; set; } = new List<SubTopic>();
}