export interface TaskModel {
  taskId: number;
  taskTitle: string;
  description?: string | null;
  taskStatusId: number;
  taskStatus: string;
  resourceURL?: string | null;
  createdDate: string;
  completedDate?: string | null;
  dueDate?: string | null;
  topicName?: string;
  subTopicName?: string;
}
