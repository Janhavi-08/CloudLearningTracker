using CloudLearningTracker.API.DTOs.Auth;
namespace CloudLearningTracker.API.Services.Interfaces;

public interface IAuthService
{
    Task RegisterAsync(RegisterRequestDto request);
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    Task<LoginResponseDto> RefreshTokenAsync( string refreshToken);
}