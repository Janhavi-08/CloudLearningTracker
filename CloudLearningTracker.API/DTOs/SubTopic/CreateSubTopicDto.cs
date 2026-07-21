using System.ComponentModel.DataAnnotations;
namespace CloudLearningTracker.API.DTOs.SubTopic;
public class CreateSubTopicDto
{
    [Required]
    public int TopicId { get; set; }

    [Required]
    [MaxLength(200)]
    public string SubTopicName { get; set; } = string.Empty;

    public string? Description { get; set; }
}