namespace CloudLearningTracker.API.DTOs.Topic;

public class TopicResponseDto
{
    public int TopicId { get; set; }

    public string TopicName { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime CreatedDate { get; set; }
}