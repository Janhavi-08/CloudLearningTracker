using CloudLearningTracker.API.Helpers;
using Microsoft.Extensions.Logging;

namespace CloudLearningTracker.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(
        RequestDelegate next,
        ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            var exceptionDetails = ExceptionMapper.Map(ex);

            _logger.Log(
                exceptionDetails.LogLevel,
                ex,
                ex.Message);

            await ExceptionResponseWriter.WriteAsync(
                context,
                exceptionDetails.StatusCode,
                exceptionDetails.Message);
        }
    }
}