using CloudLearningTracker.API.DTOs.Topic;
namespace CloudLearningTracker.API.Services.Interfaces;

public interface ITopicService
{
    Task<int> CreateTopicAsync(CreateTopicDto request, int userId);

    Task<List<TopicResponseDto>> GetTopicsAsync( int userId);

    Task<TopicResponseDto> GetTopicByIdAsync(int topicId, int userId);

    Task UpdateTopicAsync(int topicId, UpdateTopicDto request, int userId);

    Task DeleteTopicAsync(int topicId, int userId);
}