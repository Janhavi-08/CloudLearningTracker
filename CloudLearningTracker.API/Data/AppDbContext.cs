using CloudLearningTracker.API.Entities;
using Microsoft.EntityFrameworkCore;
namespace CloudLearningTracker.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext( DbContextOptions<AppDbContext> options) : base(options){ }

    public DbSet<User> Users { get; set; }

    public DbSet<Topic> Topics { get; set; }

    public DbSet<SubTopic> SubTopics { get; set; }

    public DbSet<LearningTask> Tasks { get; set; }

    public DbSet<Note> Notes { get; set; }

    public DbSet<CloudLearningTracker.API.Entities.TaskStatus> TaskStatuses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<LearningTask>()
           .HasKey(x => x.TaskId);

        modelBuilder.Entity<Topic>()
            .ToTable("Topic");

        modelBuilder.Entity<SubTopic>()
            .ToTable("SubTopic");

        modelBuilder.Entity<LearningTask>()
            .ToTable("Task");

        modelBuilder.Entity<Note>()
            .ToTable("Notes");

        modelBuilder.Entity<CloudLearningTracker.API.Entities.TaskStatus>()
            .ToTable("TaskStatus")
              .Property(e => e.StatusName)
        .HasColumnName("TaskStatus");

        base.OnModelCreating(modelBuilder);
   }
  }

