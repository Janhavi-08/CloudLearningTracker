using CloudLearningTracker.API.Data;
using CloudLearningTracker.API.DTOs.Task;
using CloudLearningTracker.API.Entities;
using CloudLearningTracker.API.Exceptions;
using CloudLearningTracker.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CloudLearningTracker.API.Services;

public class TaskService : ITaskService
{
    private readonly AppDbContext _context;
    private readonly ILogger<TopicService> _logger;


    public TaskService(AppDbContext context, ILogger<TopicService> logger)
    {
        _context = context;
        _logger = logger;

    }

    public async Task<int> CreateTaskAsync( CreateTaskDto request, int userId)
    {
        try{
            var subTopic = await _context.SubTopics
                .FirstOrDefaultAsync(x =>
                    x.SubTopicId == request.SubTopicId &&
                    x.Topic.UserId == userId);

            if (subTopic == null)
            {
                throw new NotFoundException("SubTopic not found.");
            }

            var task = new LearningTask
            {
                TaskTitle = request.TaskTitle.Trim(),
                Description = request.Description,
                SubTopicId = request.SubTopicId,
                TaskStatusId = 1,
                ResourceURL = request.ResourceURL,
                DueDate = request.DueDate,
                CreatedDate = DateTime.UtcNow
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Task created: {TaskTitle}", task.TaskTitle);

            return task.TaskId;
        }
        catch(Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating task.");
            throw;
        }
    }

    public async Task<List<TaskResponseDto>> GetTasksBySubTopicAsync( int subTopicId, int userId)
    {
        try
        {
            var subTopic = await _context.SubTopics
                .FirstOrDefaultAsync(x =>
                    x.SubTopicId == subTopicId &&
                    x.Topic.UserId == userId);

            if (subTopic == null)
            {
                throw new NotFoundException("SubTopic not found.");
            }

            return await _context.Tasks
                .AsNoTracking()
                .Where(x => x.SubTopicId == subTopicId)
                .Select(x => new TaskResponseDto
                {
                    TaskId = x.TaskId,
                    TaskTitle = x.TaskTitle,
                    Description = x.Description,
                    TaskStatusId = x.TaskStatusId,
                    TaskStatus = x.TaskStatus.StatusName,
                    ResourceURL = x.ResourceURL,
                    CreatedDate = x.CreatedDate,
                    CompletedDate = x.CompletedDate,
                    DueDate = x.DueDate
                })
                .ToListAsync();
        }
        catch(NotFoundException nf)
        {
            _logger.LogError(nf, "Failed to fetch tasks for subtopic {SubTopicId} and user {UserId}", subTopicId, userId);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch tasks for subtopic {SubTopicId} and user {UserId}", subTopicId, userId);
            throw;
        }   
    }

    public async Task<TaskResponseDto> GetTaskByIdAsync( int taskId, int userId)
    {
        try
        {

            var task = await _context.Tasks
                    .AsNoTracking()
                    .Where(x =>
                        x.TaskId == taskId &&
                        x.SubTopic.Topic.UserId == userId)
                    .Select(x => new TaskResponseDto
                    {
                        TaskId = x.TaskId,
                        TaskTitle = x.TaskTitle,
                        Description = x.Description,
                        TaskStatusId = x.TaskStatusId,
                        TaskStatus = x.TaskStatus.StatusName,
                        ResourceURL = x.ResourceURL,
                        CreatedDate = x.CreatedDate,
                        CompletedDate = x.CompletedDate,
                        DueDate = x.DueDate
                    })
                    .FirstOrDefaultAsync();

            if (task == null)
            {
                throw new NotFoundException("Task not found.");
            }

            return task;
        }
        catch (NotFoundException nf)
        {
            _logger.LogError(nf, "Failed to fetch task {TaskId} for user {UserId}", taskId, userId);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch task {TaskId} for user {UserId}", taskId, userId);
            throw;
        }
    }

    public async Task UpdateTaskAsync( int taskId, UpdateTaskDto request, int userId)
    {
        try
        {
            var task = await _context.Tasks
                            .FirstOrDefaultAsync(x =>
                                x.TaskId == taskId &&
                                x.SubTopic.Topic.UserId == userId);

            if (task == null)
            {
                throw new NotFoundException("Task not found.");
            }

            task.TaskTitle = request.TaskTitle.Trim();
            task.Description = request.Description;
            task.ResourceURL = request.ResourceURL;
            task.DueDate = request.DueDate;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Task updated: {TaskTitle}", task.TaskTitle);

        }
        catch(NotFoundException nf)
        {
            _logger.LogError(nf, "Failed to update task {TaskId} for user {UserId}", taskId, userId);
            throw;
        }
        catch(Exception ex)
        {
            _logger.LogError(ex, "Failed to update task {TaskId} for user {UserId}", taskId, userId);
            throw;            
        }
    }

    public async Task UpdateTaskStatusAsync( int taskId, int taskStatusId, int userId)
    {
        try
        {
            var task = await _context.Tasks
                            .FirstOrDefaultAsync(x =>
                                x.TaskId == taskId &&
                                x.SubTopic.Topic.UserId == userId);

            if (task == null)
            {
                throw new NotFoundException("Task not found.");
            }

            var statusExists = await _context.TaskStatuses
                .AnyAsync(x => x.TaskStatusId == taskStatusId);

            if (!statusExists)
            {
                throw new BadRequestException("Invalid task status.");
            }

            task.TaskStatusId = taskStatusId;
            task.CompletedDate = taskStatusId == 3 ? DateTime.UtcNow : null;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Task status updated for task {TaskTitle} to status {TaskStatusId}", task.TaskTitle, taskStatusId);
        }
        catch(NotFoundException nf)
        {
            _logger.LogError(nf, "Failed to update task status for task {TaskId} and user {UserId}", taskId, userId);
            throw;
        }
        catch(BadRequestException br)
        {
            _logger.LogError(br, "Invalid task status {TaskStatusId} for task {TaskId} and user {UserId}", taskStatusId, taskId, userId);
            throw;
        }
        catch(Exception ex)
        {
            _logger.LogError(ex, "Failed to update task status for task {TaskId} and user {UserId}", taskId, userId);
            throw;            
        }
    }

    public async Task DeleteTaskAsync( int taskId, int userId)
    {
        try
        {
            var task = await _context.Tasks
                .FirstOrDefaultAsync(x =>
                    x.TaskId == taskId &&
                    x.SubTopic.Topic.UserId == userId);

            if (task == null)
            {
                throw new NotFoundException("Task not found.");
            }

            _context.Tasks.Remove(task);

            await _context.SaveChangesAsync();
            _logger.LogInformation("Task deleted: {TaskTitle}", task.TaskTitle);
        }
        catch(NotFoundException nf)
        {
            _logger.LogError(nf, "Failed to delete task {TaskId} for user {UserId}", taskId, userId);
            throw;
        }
        catch(Exception ex)
        {
            _logger.LogError(ex, "Failed to delete task {TaskId} for user {UserId}", taskId, userId);
            throw;            
        }
    }
    public async Task<List<TaskResponseDto>>  SearchTasksAsync( string? keyword, int userId)
    {
        try{
            keyword = (keyword ?? string.Empty).Trim();

            return await _context.Tasks
                    .AsNoTracking()
                    .Where(x =>
                        x.SubTopic.Topic.UserId == userId
                        &&
                        (
                            x.TaskTitle.Contains(keyword)
                            ||
                            (x.Description != null
                                &&
                            x.Description.Contains(keyword))
                        ))
                    .Select(x => new TaskResponseDto
                    {
                        TaskId = x.TaskId,
                        TaskTitle = x.TaskTitle,
                        Description = x.Description,
                        TaskStatusId = x.TaskStatusId,
                        TaskStatus = x.TaskStatus.StatusName,
                        ResourceURL = x.ResourceURL,
                        CreatedDate = x.CreatedDate,
                        CompletedDate = x.CompletedDate,
                        DueDate = x.DueDate
                    }).Take(50)
                    .ToListAsync();
        }
        catch(Exception ex)
        {
            _logger.LogError(ex, "Failed to search tasks for user {UserId} with keyword {Keyword}", userId, keyword);
            throw;
        }
    }

    public async Task<TaskBoardDto> GetTaskBoardAsync(int userId)
    {

        try
        {
            var tasks = await _context.Tasks
                .AsNoTracking()
                .Where(x =>
                    x.SubTopic.Topic.UserId == userId)
                .Select(x => new TaskResponseDto
                {
                    TaskId = x.TaskId,
                    TaskTitle = x.TaskTitle,
                    Description = x.Description,
                    TaskStatusId = x.TaskStatusId,
                    TaskStatus = x.TaskStatus.StatusName,
                    ResourceURL = x.ResourceURL,
                    CreatedDate = x.CreatedDate,
                    CompletedDate = x.CompletedDate,
                    DueDate = x.DueDate,
                    TopicName = x.SubTopic.Topic.TopicName,
                    SubTopicName = x.SubTopic.SubTopicName

                })
                .ToListAsync();

            return new TaskBoardDto
            {
                NotStarted = tasks
                    .Where(x => x.TaskStatusId == 1)
                    .OrderBy(x => x.DueDate)
                    .ToList(),

                InProgress = tasks
                    .Where(x => x.TaskStatusId == 2)
                    .OrderBy(x => x.DueDate)
                    .ToList(),

                Completed = tasks
                    .Where(x => x.TaskStatusId == 3)
                    .OrderByDescending(x => x.CompletedDate)
                    .ToList()
            };
        }
        catch(Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch task details for dashboard for user {UserId}", userId);
            throw;
        }
    }
}