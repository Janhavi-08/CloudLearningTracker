using CloudLearningTracker.API.DTOs.Task;
using CloudLearningTracker.API.Extensions;
using CloudLearningTracker.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudLearningTracker.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TaskController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TaskController( ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpPost]
    public async Task<IActionResult> Create( CreateTaskDto request)
    {
        try
        {
            var userId = User.GetUserId();

            var taskId = await _taskService.CreateTaskAsync( request, userId);

            return Ok(new { TaskId = taskId });
        }catch(Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });        
        }
    }

    [HttpGet("subtopic/{subTopicId}")]
    public async Task<IActionResult> GetBySubTopic( int subTopicId)
    {
        try
        {
            var userId = User.GetUserId();

            var tasks = await _taskService.GetTasksBySubTopicAsync( subTopicId, userId);

            return Ok(tasks);
        }catch(Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });        
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById( int id)
    {
        try
        {
            var userId = User.GetUserId();

            var task = await _taskService.GetTaskByIdAsync( id, userId);

            return Ok(task);
        }catch(Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });        
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update( int id, UpdateTaskDto request)
    {
        try
        {
            var userId = User.GetUserId();

            await _taskService.UpdateTaskAsync( id, request, userId);

            return NoContent();
        }catch(Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });        
        }
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus( int id, UpdateTaskStatusDto request)
    {
        try
        {
            var userId = User.GetUserId();

            await _taskService.UpdateTaskStatusAsync( id, request.TaskStatusId, userId);

            return NoContent();
        }catch(Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });        
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete( int id)
    {
        try
        {
            var userId = User.GetUserId();

            await _taskService.DeleteTaskAsync( id, userId);

            return NoContent();
        }catch(Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });        
        }
    }
    [HttpGet("search")]
    public async Task<IActionResult> Search( [FromQuery] string? keyword)
    {
        try
        {
            var userId = User.GetUserId();

            var tasks = await _taskService.SearchTasksAsync( keyword, userId);

            return Ok(tasks);
        }catch(Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });        
        }
    }
    [HttpGet("board")]
    public async Task<IActionResult> GetBoard()
    {
        try
        {
            var userId = User.GetUserId();

            var result =  await _taskService .GetTaskBoardAsync(userId);

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