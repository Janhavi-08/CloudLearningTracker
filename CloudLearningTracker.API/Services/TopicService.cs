using CloudLearningTracker.API.Data;
using CloudLearningTracker.API.DTOs.Topic;
using CloudLearningTracker.API.Entities;
using CloudLearningTracker.API.Exceptions;
using CloudLearningTracker.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CloudLearningTracker.API.Services;
public class TopicService : ITopicService
{
    private readonly AppDbContext _context;
    private readonly ILogger<TopicService> _logger;

    public TopicService(AppDbContext context, ILogger<TopicService> logger)
    {
        _context = context;
        _logger = logger;
    }
    public async Task<int> CreateTopicAsync(CreateTopicDto request, int userId)
    {
        var exists = await _context.Topics.AnyAsync(x =>
            x.UserId == userId &&
            x.TopicName.ToLower() == request.TopicName.ToLower());

        if (exists)
            throw new BadRequestException("Topic already exists.");
            
        var topic = new Topic
        {
            TopicName = request.TopicName.Trim(),
            Description = request.Description,
            UserId = userId,
            CreatedDate = DateTime.UtcNow
        };

        _context.Topics.Add(topic);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Topic created: {TopicName}", request.TopicName);

        return topic.TopicId;
    }
    public async Task<List<TopicResponseDto>> GetTopicsAsync(int userId)
    {
        return await _context.Topics
                .AsNoTracking()
                .Where(x => x.UserId == userId)
                .Select(x => new TopicResponseDto
                {
                    TopicId = x.TopicId,
                    TopicName = x.TopicName,
                    Description = x.Description,
                    CreatedDate = x.CreatedDate
                })
                .ToListAsync();
    }

    public async Task<TopicResponseDto> GetTopicByIdAsync(int topicId, int userId)
    {
        var topic = await _context.Topics
                .AsNoTracking()
                .Where(x =>
                    x.TopicId == topicId &&
                    x.UserId == userId)
                .Select(x => new TopicResponseDto
                {
                    TopicId = x.TopicId,
                    TopicName = x.TopicName,
                    Description = x.Description,
                    CreatedDate = x.CreatedDate
                })
                .FirstOrDefaultAsync();

        if (topic == null)
        {
            throw new NotFoundException("Topic not found.");
        }

        return topic;
    }

    public async Task UpdateTopicAsync(int topicId, UpdateTopicDto request, int userId)
    {

        var topic = await _context.Topics
                        .FirstOrDefaultAsync(x =>
                                x.TopicId == topicId &&
                                x.UserId == userId);
        if (topic == null)
        {
            throw new NotFoundException("Topic not found.");
        }

        var exists = await _context.Topics.AnyAsync(x =>
           x.UserId == userId &&
           x.TopicName.ToLower() == request.TopicName.ToLower());
            
        if (exists)
            throw new BadRequestException("Topic already exists.");
            
        topic.TopicName = request.TopicName.Trim();
        topic.Description = request.Description;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Topic Updated: {TopicName}", request.TopicName);
    }
    
    public async Task DeleteTopicAsync( int topicId, int userId)
    {
        var topic = await _context.Topics
            .FirstOrDefaultAsync(x =>
                x.TopicId == topicId &&
                x.UserId == userId);

        if (topic == null)
        {
            throw new NotFoundException( "Topic not found.");
        }

        _context.Topics.Remove(topic);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Topic deleted: {TopicName}", topic.TopicName);       
    
    }
}