using System.ComponentModel.DataAnnotations;

namespace CloudLearningTracker.API.DTOs.Auth;

public class RegisterRequestDto
{
    [Required(ErrorMessage = "Username is required.")]
    [MaxLength(255)] 
    public string Username { get; set; } = string.Empty;
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email address.")]
    [MaxLength(255)] 
    public string Email { get; set; } = string.Empty;
    [Required(ErrorMessage = "Password is required.")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
    [MaxLength(100, ErrorMessage = "Password cannot exceed 100 characters.")]
    public string Password { get; set; } = string.Empty;
}