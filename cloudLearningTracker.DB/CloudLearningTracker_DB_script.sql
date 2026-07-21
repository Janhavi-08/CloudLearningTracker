-- Create Database
CREATE DATABASE CloudLearningTracker;
GO

USE CloudLearningTracker;
GO

/*=========================================================
  1. Users
=========================================================*/
CREATE TABLE Users
(
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL,
    Username NVARCHAR(100) NOT NULL,
    PasswordHash NVARCHAR(500) NOT NULL,
    PasswordSalt NVARCHAR(500) NULL,
    EmailConfirmed BIT DEFAULT(0),
    FailedLoginAttempts INT DEFAULT(0),
    LockoutEndDate DATETIME2 NULL,
    RefreshToken NVARCHAR(MAX) NULL,
    RefreshTokenExpiry DATETIME2 NULL,
    IsActive BIT NOT NULL DEFAULT(1),
    DateCreated DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    LastLoginDate DATETIME2 NULL,
);

ALTER TABLE Users
ADD CONSTRAINT UQ_Users_Email UNIQUE (Email);

ALTER TABLE Users
ADD CONSTRAINT UQ_Users_Username UNIQUE (Username);

GO

/*=========================================================
  2. Topic
=========================================================*/
CREATE TABLE Topic
(
    TopicId INT IDENTITY(1,1) PRIMARY KEY,
    TopicName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    CreatedDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UserId INT NOT NULL,

    CONSTRAINT FK_Topic_User
        FOREIGN KEY (UserId)
        REFERENCES Users(UserId)
);
GO

/*=========================================================
  3. SubTopic
=========================================================*/
CREATE TABLE SubTopic
(
    SubTopicId INT IDENTITY(1,1) PRIMARY KEY,
    SubTopicName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    CreatedDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    TopicId INT NOT NULL,

    CONSTRAINT FK_SubTopic_Topic
        FOREIGN KEY (TopicId)
        REFERENCES Topic(TopicId)
);
GO

/*=========================================================
  4. TaskStatus
=========================================================*/
CREATE TABLE TaskStatus
(
    TaskStatusId INT IDENTITY(1,1) PRIMARY KEY,
    TaskStatus NVARCHAR(50) NOT NULL
);
GO

/*=========================================================
  5. Task
=========================================================*/
CREATE TABLE Task
(
    TaskId INT IDENTITY(1,1) PRIMARY KEY,
    TaskTitle NVARCHAR(300) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    SubTopicId INT NOT NULL,
    TaskStatusId INT NOT NULL,
    ResourceURL NVARCHAR(1000) NULL,
    CreatedDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CompletedDate DATETIME2 NULL,
    DueDate DATETIME2 NULL,

    CONSTRAINT FK_Task_SubTopic
        FOREIGN KEY (SubTopicId)
        REFERENCES SubTopic(SubTopicId),

    CONSTRAINT FK_Task_TaskStatus
        FOREIGN KEY (TaskStatusId)
        REFERENCES TaskStatus(TaskStatusId)
);
GO

/*=========================================================
  6. Notes
=========================================================*/
CREATE TABLE Notes
(
    NoteId INT IDENTITY(1,1) PRIMARY KEY,
    NoteTitle NVARCHAR(300) NOT NULL,
    Content NVARCHAR(MAX) NULL,
    SubTopicId INT NOT NULL,
    CreatedDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ResourceURL NVARCHAR(1000) NULL,

    CONSTRAINT FK_Notes_SubTopic
        FOREIGN KEY (SubTopicId)
        REFERENCES SubTopic(SubTopicId)
);
GO

 
INSERT INTO TaskStatus (TaskStatus)
VALUES
    ('Not Started'),
    ('In Progress'),
    ('Completed');