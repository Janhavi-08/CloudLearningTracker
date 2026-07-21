using CloudLearningTracker.API.DTOs.Auth;
using CloudLearningTracker.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CloudLearningTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequestDto request)
    {
        await _authService.RegisterAsync(request);

        return Ok(new
        {
            Message = "User registered successfully"
        });
    }
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequestDto request)
    {
        var result =
            await _authService.LoginAsync(request);

        return Ok(result);
    }
    
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken(RefreshTokenRequestDto request)
    {       
        var result =
            await _authService
                .RefreshTokenAsync(
                    request.RefreshToken);

        return Ok(result);       
    }
}