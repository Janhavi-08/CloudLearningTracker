using System.ComponentModel.DataAnnotations;
namespace CloudLearningTracker.API.DTOs.Notes;
public class UpdateNoteDto
{
    [Required]
    [MaxLength(300)]
    public string NoteTitle { get; set; } = string.Empty;

    public string? Content { get; set; }

    public string? ResourceURL { get; set; }
}