using System.Net;
using CloudLearningTracker.API.Exceptions;
using CloudLearningTracker.API.Helpers.Models;
using Microsoft.Extensions.Logging;

namespace CloudLearningTracker.API.Helpers;

public static class ExceptionMapper
{
    public static ExceptionDetails Map(Exception exception)
    {
        return exception switch
        {
            BadRequestException ex => new ExceptionDetails
            {
                StatusCode = (int)HttpStatusCode.BadRequest,
                Message = ex.Message,
                LogLevel = LogLevel.Warning
            },

            UnauthorizedException ex => new ExceptionDetails
            {
                StatusCode = (int)HttpStatusCode.Unauthorized,
                Message = ex.Message,
                LogLevel = LogLevel.Warning
            },

            ForbiddenException ex => new ExceptionDetails
            {
                StatusCode = (int)HttpStatusCode.Forbidden,
                Message = ex.Message,
                LogLevel = LogLevel.Warning
            },

            NotFoundException ex => new ExceptionDetails
            {
                StatusCode = (int)HttpStatusCode.NotFound,
                Message = ex.Message,
                LogLevel = LogLevel.Information
            },

            _ => new ExceptionDetails
            {
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Message = "An unexpected error occurred.",
                LogLevel = LogLevel.Error
            }
        };
    }
}