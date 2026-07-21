using Microsoft.Extensions.Logging;

namespace CloudLearningTracker.API.Helpers.Models;

public class ExceptionDetails
{
    public int StatusCode { get; set; }

    public string Message { get; set; } = string.Empty;

    public LogLevel LogLevel { get; set; }
}