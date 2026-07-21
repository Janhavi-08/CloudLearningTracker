using CloudLearningTracker.API.DTOs.Task;

namespace CloudLearningTracker.API.DTOs.Task;

public class TaskBoardDto
{
    public List<TaskResponseDto> NotStarted { get; set; }
        = new();

    public List<TaskResponseDto> InProgress { get; set; }
        = new();

    public List<TaskResponseDto> Completed { get; set; }
        = new();
}