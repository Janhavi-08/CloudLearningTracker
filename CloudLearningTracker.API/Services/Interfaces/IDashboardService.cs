using CloudLearningTracker.API.DTOs.Dashboard;
namespace CloudLearningTracker.API.Services.Interfaces;
public interface IDashboardService
{
    Task<DashboardProgressDto> GetProgressAsync(int userId);

    Task<TopicProgressDto> GetTopicProgressAsync( int topicId, int userId);

    Task<List<UpcomingTaskDto>> GetUpcomingTasksAsync( int userId);

    Task<List<TopicProgressSummaryDto>> GetTopicProgressSummaryAsync( int userId);

    Task<List<DueTaskDto>> GetDueTasksAsync( int userId);

    Task<List<RecentActivityDto>> GetRecentActivityAsync( int userId);
}