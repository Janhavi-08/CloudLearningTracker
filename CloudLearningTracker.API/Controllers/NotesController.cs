using CloudLearningTracker.API.DTOs.Notes;
using CloudLearningTracker.API.Extensions;
using CloudLearningTracker.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudLearningTracker.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotesController : ControllerBase
{
    private readonly INoteService _noteService;

    public NotesController(
        INoteService noteService)
    {
        _noteService = noteService;
    }
    [HttpPost]
    public async Task<IActionResult> Create(CreateNoteDto request, INoteService _noteService1)
    {
        try
        {
            var userId = User.GetUserId();

            var noteId = await _noteService1.CreateNoteAsync( request, userId);

            return Ok(new { NoteId = noteId });
        }
        catch (Exception ex)
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

            var notes = await _noteService.GetNotesBySubTopicAsync( subTopicId,userId);

            return Ok(notes);
        }catch(Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });        
        }
    }
    [HttpGet]
    public async Task<IActionResult> GetAll(){
        try
        {
            var userId = User.GetUserId();

            var notes = await _noteService.GetNotesAsync(userId);

            return Ok(notes);
        }catch(Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });        
        }
    }
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    { try
        {
            var userId = User.GetUserId();

            var note = await _noteService.GetNoteByIdAsync(id, userId);

            return Ok(note);
        }catch(Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message
            });        
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update( int id, UpdateNoteDto request)
    {
        try
        {
            var userId = User.GetUserId();

            await _noteService.UpdateNoteAsync( id, request, userId);

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

            await _noteService.DeleteNoteAsync( id, userId);

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

            var result = await _noteService.SearchNotesAsync(keyword, userId);

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