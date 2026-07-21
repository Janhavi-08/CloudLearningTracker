using CloudLearningTracker.API.DTOs.Topic;
using CloudLearningTracker.API.Extensions;
using CloudLearningTracker.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TopicController : ControllerBase
{
    private readonly ITopicService _topicService;

    public TopicController(ITopicService topicService)
    {
        _topicService = topicService;
    }
    
    [HttpPost]
    public async Task<IActionResult> Create( CreateTopicDto request)
    {
        try
        {
            var userId = User.GetUserId();

            var topicId = await _topicService.CreateTopicAsync( request, userId);

            return CreatedAtAction(
            nameof(GetById),
            new { id = topicId },
            new { topicId });
        }catch(Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });        
        }
    }
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var userId = User.GetUserId();

            var topics = await _topicService.GetTopicsAsync( userId);

            return Ok(topics);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var userId = User.GetUserId();

            var topic = await _topicService.GetTopicByIdAsync( id, userId);

            return Ok(topic);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateTopicDto request)
    {
        try
        {
            var userId = User.GetUserId();

            await _topicService.UpdateTopicAsync( id, request, userId);

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });
        }
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var userId = User.GetUserId();

            await _topicService.DeleteTopicAsync( id, userId);

            return NoContent();
        }catch(Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });        
        }
    }
}