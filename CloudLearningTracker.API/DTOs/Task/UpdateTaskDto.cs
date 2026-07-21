using System.ComponentModel.DataAnnotations;
namespace CloudLearningTracker.API.DTOs.Task;
public class UpdateTaskDto
{
    [Required]
    public string TaskTitle { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? ResourceURL { get; set; }

    public DateTime? DueDate { get; set; }
}