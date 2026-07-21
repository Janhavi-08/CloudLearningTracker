using CloudLearningTracker.API.DTOs.SubTopic;

namespace CloudLearningTracker.API.Services.Interfaces;
public interface ISubTopicService
{
    Task<int> CreateSubTopicAsync(CreateSubTopicDto request, int userId);

    Task<List<SubTopicResponseDto>> GetSubTopicsByTopicAsync(int topicId, int userId);

    Task<SubTopicResponseDto> GetByIdAsync(int subTopicId, int userId);

    Task UpdateAsync(int subTopicId, UpdateSubTopicDto request, int userId);

    Task DeleteAsync(int subTopicId, int userId);
}