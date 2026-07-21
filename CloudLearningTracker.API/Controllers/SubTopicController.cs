using CloudLearningTracker.API.DTOs.SubTopic;
using CloudLearningTracker.API.Extensions;
using CloudLearningTracker.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SubTopicController : ControllerBase
{
    private readonly ISubTopicService _service;

    public SubTopicController(
        ISubTopicService service)
    {
        _service = service;
    }
    [HttpPost]
    public async Task<IActionResult> CreateSubTopic([FromBody] CreateSubTopicDto request)
    {
        try
        {
            var userId = User.GetUserId();
            var subTopicId = await _service.CreateSubTopicAsync(request, userId);
            return CreatedAtAction(
             nameof(GetById),
             new { id = subTopicId },
             new { subTopicId });
        }catch(Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });        
        }
    }
    [HttpGet]
    public async Task<IActionResult> GetSubTopicsByTopic(int topicId)
    {
        try
        {
            var userId = User.GetUserId();
            var subTopics = await _service.GetSubTopicsByTopicAsync(topicId, userId);
            return Ok(subTopics);
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
            var subTopic = await _service.GetByIdAsync(id, userId);
            if (subTopic == null)
            {
                return NotFound();
            }
            return Ok(subTopic);
        }catch(Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });        
        }
    }
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSubTopicDto request)
    {
        try
        {
            var userId = User.GetUserId();
            await _service.UpdateAsync(id, request, userId);
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
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var userId = User.GetUserId();
            await _service.DeleteAsync(id, userId);
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