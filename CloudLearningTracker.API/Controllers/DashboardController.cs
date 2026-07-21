using CloudLearningTracker.API.Extensions;
using CloudLearningTracker.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController
    : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }
    
    [HttpGet("progress")]
    public async Task<IActionResult> GetProgress()
    {
        try
        {
            var userId = User.GetUserId();

            return Ok(await _dashboardService.GetProgressAsync(userId));
        }catch(Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });        
        }
    }
    [HttpGet("topic-progress/{topicId}")]
    public async Task<IActionResult> GetTopicProgress(int topicId)
    {
        try
        {
            var userId = User.GetUserId();

            return Ok(
                await _dashboardService
                    .GetTopicProgressAsync(
                        topicId,
                        userId));
        }catch(Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });        
        }
    }
    [HttpGet("upcoming-tasks")]
    public async Task<IActionResult> GetUpcomingTasks()
    {
        try
        {
            var userId = User.GetUserId();

            return Ok(
                await _dashboardService
                    .GetUpcomingTasksAsync(
                        userId));
        }catch(Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });        
        }
    }
    [HttpGet("topic-progress")]
    public async Task<IActionResult> GetTopicProgressSummary()
    {
        try
        {
            var userId = User.GetUserId();

            var result =
                await _dashboardService
                    .GetTopicProgressSummaryAsync(
                        userId);

            return Ok(result);
        }
        catch(Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });        
        }
    }

    [HttpGet("due-tasks")]
    public async Task<IActionResult> GetDueTasks()
    {
        try
        {
            var userId = User.GetUserId();

            var result =
                await _dashboardService
                    .GetDueTasksAsync(userId);

            return Ok(result);
        }catch(Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });        
        }
    }

    [HttpGet("recent-activity")]
    public async Task<IActionResult>  GetRecentActivity()
    {
        try
        {
            var userId = User.GetUserId();

            var result =
                await _dashboardService
                    .GetRecentActivityAsync(userId);

            return Ok(result);
        }catch(Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });        
        }
    }
    }