using BCrypt.Net;
using CloudLearningTracker.API.Data;
using CloudLearningTracker.API.DTOs.Auth;
using CloudLearningTracker.API.Entities;
using CloudLearningTracker.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using CloudLearningTracker.API.Exceptions;
using System.Security.Cryptography;
namespace CloudLearningTracker.API.Services;
using System.Text;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthService> _logger;
    public AuthService(AppDbContext context, ITokenService tokenService, ILogger<AuthService> logger)
    {
        _context = context;
        _tokenService = tokenService;
        _logger = logger;
    }

    public async Task RegisterAsync(RegisterRequestDto request)
    {
        try
        {
            request.Email = request.Email.Trim().ToLower();

            var existingUser = await _context.Users
                        .FirstOrDefaultAsync(x =>
                            x.Email == request.Email ||
                            x.Username == request.Username);
            if (existingUser?.Email == request.Email)
            {
                throw new BadRequestException("User already exists.");
            }

            var user = new User
            {
                Email = request.Email,
                Username = request.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                PasswordSalt = null,
                EmailConfirmed = false,
                FailedLoginAttempts = 0,
                IsActive = true,
                DateCreated = DateTime.UtcNow
            };

            _context.Users.Add(user);

            await _context.SaveChangesAsync();
            _logger.LogInformation("User created: {Username}", request.Username);
        }
        catch (BadRequestException br)
        {
            _logger.LogWarning( br, "Registration failed because email already exists.");
                throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create User for user {Username}", request.Username);
            throw;
        }
    }

    public async Task<LoginResponseDto> LoginAsync( LoginRequestDto request)
    {
        try
        {
            request.Email = request.Email.Trim().ToLower();

            var user = await _context.Users.FirstOrDefaultAsync(x => x.Email == request.Email);

            if (user == null)
            {
                throw new BadRequestException("Invalid credentials.");
            }
            var isValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

            if (!isValid)
            {
                throw new Exception("Invalid credentials.");
            }

            var refreshToken = GenerateRefreshToken();
            
            user.RefreshToken = HashRefreshToken(refreshToken);

            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

            await _context.SaveChangesAsync();
            _logger.LogInformation( "Refresh token generated for user {UserId}",user.UserId);
            var accessToken = _tokenService.GenerateToken(user);

            return new LoginResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                Username = user.Username
            };
        }
        catch (BadRequestException br)
        {
            _logger.LogWarning(br,"Login failed for email {Email}", request.Email);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login failed for email {Email}", request.Email);
            throw;
        }
    }
    public string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }
    private string HashRefreshToken(string refreshToken)
    {
        using var sha256 = SHA256.Create();

        var bytes = Encoding.UTF8.GetBytes(refreshToken);

        var hash = sha256.ComputeHash(bytes);

        return Convert.ToHexString(hash);
    }
    public async Task<LoginResponseDto> RefreshTokenAsync( string refreshToken)
    {
        try
        {
            var hashedToken = HashRefreshToken(refreshToken);

            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.RefreshToken == hashedToken);

            if (user == null)
            {
                throw new BadRequestException("Invalid refresh token.");
            }

            if (user.RefreshTokenExpiry <
                DateTime.UtcNow)
            {
                throw new BadRequestException("Refresh token expired.");
            }

            var newAccessToken = _tokenService.GenerateToken(user);

            var newRefreshToken = GenerateRefreshToken();

            user.RefreshToken = HashRefreshToken(newRefreshToken);

            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

            await _context.SaveChangesAsync();
            _logger.LogInformation("Generated Refresh Token.");

            return new LoginResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                Username = user.Username
            };
        }
         catch (BadRequestException br)
        {
            _logger.LogError(br,"");
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "There is an issue with refresh token.");
            throw;
        }
    }
}