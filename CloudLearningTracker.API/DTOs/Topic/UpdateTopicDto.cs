using System.ComponentModel.DataAnnotations;

namespace CloudLearningTracker.API.DTOs.Topic;

public class UpdateTopicDto
{
    [Required]
    [MaxLength(200)]
    public string TopicName { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }
}