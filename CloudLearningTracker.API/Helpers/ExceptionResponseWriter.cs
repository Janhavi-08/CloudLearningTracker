using System.Text.Json;
using CloudLearningTracker.API.DTOs.Common;

namespace CloudLearningTracker.API.Helpers;

public static class ExceptionResponseWriter
{
    public static async Task WriteAsync( HttpContext context, int statusCode, string message)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var response = new ErrorResponseDto
        {
            StatusCode = statusCode,
            Message = message
        };

        await context.Response.WriteAsync( JsonSerializer.Serialize(response));
    }
}