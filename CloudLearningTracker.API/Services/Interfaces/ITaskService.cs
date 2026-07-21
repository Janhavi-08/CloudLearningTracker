using CloudLearningTracker.API.DTOs.Task;

namespace CloudLearningTracker.API.Services.Interfaces;

public interface ITaskService
{
    Task<int> CreateTaskAsync(CreateTaskDto request, int userId);

    Task<List<TaskResponseDto>> GetTasksBySubTopicAsync(int subTopicId, int userId);

    Task<TaskResponseDto> GetTaskByIdAsync(int taskId, int userId);

    Task UpdateTaskAsync(int taskId, UpdateTaskDto request, int userId);

    Task UpdateTaskStatusAsync(int taskId, int taskStatusId, int userId);

    Task DeleteTaskAsync(int taskId, int userId);

    Task<List<TaskResponseDto>> SearchTasksAsync(string? keyword, int userId);
    
    Task<TaskBoardDto> GetTaskBoardAsync(int userId);
}