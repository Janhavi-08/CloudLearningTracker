using System.ComponentModel.DataAnnotations;
namespace CloudLearningTracker.API.DTOs.SubTopic;

public class UpdateSubTopicDto
{
    [Required]
    [MaxLength(200)]
    public string SubTopicName { get; set; } = string.Empty;

    public string? Description { get; set; }
}