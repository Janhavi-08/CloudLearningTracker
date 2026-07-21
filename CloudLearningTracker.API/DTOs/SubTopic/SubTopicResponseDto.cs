namespace CloudLearningTracker.API.DTOs.SubTopic;

public class SubTopicResponseDto
{
    public int SubTopicId { get; set; }

    public string SubTopicName { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int TopicId { get; set; }

    public DateTime CreatedDate { get; set; }
}