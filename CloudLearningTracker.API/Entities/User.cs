namespace CloudLearningTracker.API.Entities;

public class User
{
    public int UserId { get; set; }
    
    public string Email { get; set; } = string.Empty;

    public string Username { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string? PasswordSalt { get; set; }

    public bool EmailConfirmed { get; set; }

    public int FailedLoginAttempts { get; set; }

    public DateTime? LockoutEndDate { get; set; }

    public string? RefreshToken { get; set; }

    public DateTime? RefreshTokenExpiry { get; set; }

    public bool IsActive { get; set; }

    public DateTime DateCreated { get; set; }

    public DateTime? LastLoginDate { get; set; }

    // Navigation Property
    public ICollection<Topic> Topics { get; set; } = new List<Topic>();
}