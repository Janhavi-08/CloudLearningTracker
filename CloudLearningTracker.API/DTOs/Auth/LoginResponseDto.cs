namespace CloudLearningTracker.API.DTOs.Auth;

public class LoginResponseDto
{
    public string AccessToken { get; set; } = string.Empty;

    public string RefreshToken { get; set; } = string.Empty;

    public string Username { get; set; } = string.Empty;

    public DateTime Expiry { get; set; }
}