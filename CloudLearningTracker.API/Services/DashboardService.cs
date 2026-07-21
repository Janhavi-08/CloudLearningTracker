using CloudLearningTracker.API.Data;
using CloudLearningTracker.API.DTOs.Dashboard;
using CloudLearningTracker.API.Exceptions;
using CloudLearningTracker.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CloudLearningTracker.API.Services;
public class DashboardService : IDashboardService
{
    public readonly AppDbContext _context;
    private readonly ILogger<TopicService> _logger;
    public DashboardService(AppDbContext context,ILogger<TopicService> logger)
    {
        _context = context;
        _logger = logger;
    }
    public async Task<DashboardProgressDto> GetProgressAsync(int userId)
    {
        try
        {
            var tasks = await _context.Tasks
                            .AsNoTracking()
                                .Where(x =>
                                    x.SubTopic.Topic.UserId == userId)
                                .ToListAsync();

            var total = tasks.Count;

            var completed = tasks.Count(x => x.TaskStatusId == 3);

            var inProgress = tasks.Count(x => x.TaskStatusId == 2);

            var notStarted = tasks.Count(x => x.TaskStatusId == 1);

            var totalSubtopics = await _context.SubTopics
                                    .AsNoTracking()
                                    .Where(x => x.Topic.UserId == userId)
                                    .CountAsync();
            var totalNotes = await _context.Notes
                                    .AsNoTracking()
                                    .Where(x => x.SubTopic.Topic.UserId == userId)
                                    .CountAsync();
            return new DashboardProgressDto
            {
                TotalTasks = total,
                CompletedTasks = completed,
                InProgressTasks = inProgress,
                NotStartedTasks = notStarted,
                CompletionPercentage =
                    total == 0
                        ? 0
                        : Math.Round(
                            (double)completed / total * 100,
                            2),
                TotalSubtopics = totalSubtopics,
                TotalNotes = totalNotes
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch progress for user {UserId}", userId);
            throw;
        }

    }
    public async Task<TopicProgressDto> GetTopicProgressAsync( int topicId, int userId)
    {
        try
        {
            var topic = await _context.Topics
                            .FirstOrDefaultAsync(x =>
                                x.TopicId == topicId &&
                                x.UserId == userId);

            if (topic == null)
            {
                throw new NotFoundException("Topic not found.");
            }

            var tasks = await _context.Tasks
                                .Where(x =>
                                    x.SubTopic.TopicId == topicId)
                                .ToListAsync();

            var total = tasks.Count;

            var completed = tasks.Count(x => x.TaskStatusId == 3);

            return new TopicProgressDto
            {
                TopicId = topic.TopicId,
                TopicName = topic.TopicName,
                TotalTasks = total,
                CompletedTasks = completed,
                CompletionPercentage =
                    total == 0
                        ? 0
                        : Math.Round(
                            (double)completed / total * 100,
                            2)
            };
        }
        catch (NotFoundException nf)
        {
            _logger.LogError(nf, "Failed to fetch Topic Progress for user {UserId}", userId);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch Topic Progress for user {UserId}", userId);
            throw;
        }
    }
    public async Task<List<UpcomingTaskDto>> GetUpcomingTasksAsync(int userId)
    {
        try
        {
            return await _context.Tasks
                .Where(x =>
                    x.SubTopic.Topic.UserId == userId &&
                    x.DueDate != null &&
                    x.TaskStatusId != 3)
                .OrderBy(x => x.DueDate)
                .Take(10)
                .Select(x => new UpcomingTaskDto
                {
                    TaskId = x.TaskId,
                    TaskTitle = x.TaskTitle,
                    DueDate = x.DueDate,
                    SubTopicName =
                        x.SubTopic.SubTopicName
                })
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch Upcoming Tasks for user {UserId}", userId);
            throw;
        }
    }
    
    public async Task<List<TopicProgressSummaryDto>> GetTopicProgressSummaryAsync( int userId)
    {
        try
        {
            var topics = await _context.Topics
                .AsNoTracking()
                .Where(x => x.UserId == userId)
                .Select(x => new
                {
                    x.TopicId,
                    x.TopicName,

                    TotalTasks = x.SubTopics
                        .SelectMany(st => st.Tasks)
                        .Count(),

                    CompletedTasks = x.SubTopics
                        .SelectMany(st => st.Tasks)
                        .Count(t => t.TaskStatusId == 3)
                })
                .ToListAsync();

            return topics
                .Select(x => new TopicProgressSummaryDto
                {
                    TopicId = x.TopicId,

                    TopicName = x.TopicName,

                    TotalTasks = x.TotalTasks,

                    CompletedTasks = x.CompletedTasks,

                    CompletionPercentage =
                        x.TotalTasks == 0
                            ? 0
                            : Math.Round(
                                (double)x.CompletedTasks /
                                x.TotalTasks * 100,
                                2)
                })
                .OrderByDescending(x =>
                    x.CompletionPercentage)
                .ToList();

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch Topic Progress Summary for user {UserId}", userId);
            throw;
        }
    }

    public async Task<List<DueTaskDto>> GetDueTasksAsync( int userId)
    {
        try
        {
            var today = DateTime.Today;

            var tasks = await _context.Tasks
                .AsNoTracking()
                .Where(x =>
                    x.SubTopic.Topic.UserId == userId &&
                    x.DueDate != null &&
                    x.TaskStatusId != 3)
                .Select(x => new
                {
                    x.TaskId,
                    x.TaskTitle,
                    x.DueDate,
                    SubTopicName = x.SubTopic.SubTopicName
                })
                .ToListAsync();

            return tasks
                .Select(x => new DueTaskDto
                {
                    TaskId = x.TaskId,
                    TaskTitle = x.TaskTitle,
                    DueDate = x.DueDate,
                    SubTopicName = x.SubTopicName,
                    DueDays = GetDueDays(x.DueDate, today)
                })
                .Where(x => x.DueDays != null && x.DueDays.StartsWith("-"))
                .OrderBy(x => x.DueDate)
                .ToList();
        }
          catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch Due Tasks for user {UserId}", userId);
            throw;
        }
    }

    private static string? GetDueDays(DateTime? dueDate, DateTime today)
    {
        if (dueDate is not DateTime value)
        {
            return null;
        }

        var days = (value.Date - today).Days;

        if (days < 0)
        {
            return $"-{Math.Abs(days)} day{(Math.Abs(days) == 1 ? string.Empty : "s")}";
        }

        return null;
    }

    public async Task<List<RecentActivityDto>> GetRecentActivityAsync( int userId)
    {

        try
        {
            var today = DateTime.Today;
            var taskActivities = await _context.Tasks
                .AsNoTracking()
                .Where(x => x.SubTopic.Topic.UserId == userId)
                .Select(x => new RecentActivityDto
                {
                    Type = "task",
                    Title = x.TaskTitle,
                    Detail = x.TaskStatusId == 3 ? "Completed task" : "Updated task",
                    Time = x.CompletedDate ?? x.CreatedDate,
                    Tag = x.TaskStatusId == 3 ? "Completed" : "Updated"
                })
                .ToListAsync();


            var noteActivities = await _context.Notes
                .AsNoTracking()
                .Where(x => x.SubTopic.Topic.UserId == userId)
                .Select(x => new RecentActivityDto
                {
                    Type = "note",
                    Title = x.NoteTitle,
                    Detail = "Added note",
                    Time = x.CreatedDate,
                    Tag = "Note"
                })
                .ToListAsync();

            return taskActivities
                .Concat(noteActivities)
                .OrderByDescending(x => x.Time)
                .Take(8)
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch Recent Activity for user {UserId}", userId);
            throw;
        }
    }
}