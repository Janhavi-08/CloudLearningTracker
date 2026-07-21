using CloudLearningTracker.API.Entities;
namespace CloudLearningTracker.API.Services.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user);
}