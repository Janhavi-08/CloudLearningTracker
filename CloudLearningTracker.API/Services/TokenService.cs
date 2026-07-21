using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CloudLearningTracker.API.Entities;
using Microsoft.IdentityModel.Tokens;
using CloudLearningTracker.API.Services.Interfaces;
using Microsoft.Extensions.Options;

namespace CloudLearningTracker.API.Services;

public class TokenService : ITokenService
{
    private readonly JwtSettings _jwt;
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration, IOptions<JwtSettings> options)
    {
        _configuration = configuration;
        _jwt = options.Value;

    }

    public string GenerateToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name,  user.Username)
        };
        
        var key = new SymmetricSecurityKey( Encoding.UTF8.GetBytes(_jwt.Key));

        var credentials = new SigningCredentials( key, SecurityAlgorithms.HmacSha256);
        var expirationMinutes = _jwt.ExpirationMinutes;

        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}