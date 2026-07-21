export interface TopicProgressSubItem {
  subTopicName: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  hasNoTasks?: boolean;
}

export interface TopicProgressItem {
  topicId: number;
  topicName: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  subTopics?: TopicProgressSubItem[];
}
