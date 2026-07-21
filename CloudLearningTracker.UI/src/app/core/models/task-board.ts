export interface TaskItem {
  taskId: number;
  taskTitle: string;
  description: string;
  taskStatusId: number;
  taskStatus: string;
  resourceURL?: string | null;
  dueDate?: string | null;
  createdDate?: string | null;
  completedDate?: string | null;
  topicName: string;
  subTopicName: string;
  subTopicId?: number;
}

export interface TaskBoard {
  notStarted: TaskItem[];
  inProgress: TaskItem[];
  completed: TaskItem[];
}
