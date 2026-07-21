using System.ComponentModel.DataAnnotations;
namespace CloudLearningTracker.API.DTOs.Notes;
public class CreateNoteDto
{
    [Required]
    public int SubTopicId { get; set; }

    [Required]
    [MaxLength(300)]
    public string NoteTitle { get; set; } = string.Empty;

    public string? Content { get; set; }

    public string? ResourceURL { get; set; }
}