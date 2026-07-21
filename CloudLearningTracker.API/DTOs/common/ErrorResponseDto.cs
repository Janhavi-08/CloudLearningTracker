namespace CloudLearningTracker.API.DTOs.Common;

public class ErrorResponseDto
{
    public bool Success { get; set; } = false;

    public int StatusCode { get; set; }

    public string Message { get; set; } = string.Empty;
    public EventId EventId { get; set; }
}