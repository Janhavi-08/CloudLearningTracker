using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CloudLearningTracker.API.Data;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/test")]
public class TestController : ControllerBase
{
    private readonly AppDbContext _context;

    public TestController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync();
            if (!canConnect)
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = "Database is unavailable." });
            }

            var userCount = await _context.Users.CountAsync();
            return Ok(new { userCount, status = "connected" });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
        }
    }
    
}