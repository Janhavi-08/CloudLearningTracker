using System.Security.Claims;

namespace CloudLearningTracker.API.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var userId = user.FindFirst(
            ClaimTypes.NameIdentifier)?.Value;

        return int.Parse(userId!);
    }
}