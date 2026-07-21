import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardProgress } from '../models/dashboard-progress';
import { TopicProgressItem } from '../models/topic-progress-item';
import { UpcomingTask } from '../models/upcoming-task';
import { TaskBoard } from '../models/task-board';
import { Topic } from '../models/topic';
import { SubTopic } from '../models/subtopic';
import { TaskModel } from '../models/task';
import { Note } from '../models/note';
import { DueTask } from '../models/due-task';
import { environment } from '../environments/environment';

interface RecentActivityItem {
  title: string;
  detail: string;
  time?: string | null;
  tag: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  getProgress(): Observable<DashboardProgress> {
    return this.http.get<DashboardProgress>(`${environment.apiUrl}/dashboard/progress`);
  }

  getTopicProgress(): Observable<TopicProgressItem[]> {
    return this.http.get<TopicProgressItem[]>(`${environment.apiUrl}/dashboard/topic-progress`);
  }

  getUpcomingTasks(): Observable<UpcomingTask[]> {
    return this.http.get<UpcomingTask[]>(`${environment.apiUrl}/dashboard/upcoming-tasks`);
  }
  
  getDueTasks(): Observable<DueTask[]> {
    return this.http.get<DueTask[]>(`${environment.apiUrl}/dashboard/due-tasks`);
  }

  getBoard(): Observable<TaskBoard> {
    return this.http.get<TaskBoard>(`${environment.apiUrl}/Task/board`);
  }

  getRecentActivity(): Observable<RecentActivityItem[]> {
    return this.http.get<RecentActivityItem[]>(`${environment.apiUrl}/Dashboard/recent-activity`);
  }

  updateTaskStatus(taskId: number, status: number): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/Task/${taskId}/status`, { taskStatusId: status });
  }

  getTopics(): Observable<Topic[]> {
    return this.http.get<Topic[]>(`${environment.apiUrl}/Topic`);
  }

  createTopic(payload: { topicName: string; description?: string }): Observable<{ topicId: number }> {
    return this.http.post<{ topicId: number }>(`${environment.apiUrl}/Topic`, payload);
  }

  updateTopic(topicId: number, payload: { topicName: string; description?: string }): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/Topic/${topicId}`, payload);
  }

  deleteTopic(topicId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/Topic/${topicId}`);
  }

  getSubTopics(topicId: number): Observable<SubTopic[]> {
    return this.http.get<SubTopic[]>(`${environment.apiUrl}/SubTopic?topicId=${topicId}`);
  }

  createSubTopic(payload: { topicId: number | null; subTopicName: string; description?: string }): Observable<{ subTopicId: number }> {
    return this.http.post<{ subTopicId: number }>(`${environment.apiUrl}/SubTopic`, payload);
  }

  updateSubTopic(subTopicId: number, payload: { topicId?: number | null; subTopicName: string; description?: string }): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/SubTopic/${subTopicId}`, payload);
  }

  deleteSubTopic(subTopicId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/SubTopic/${subTopicId}`);
  }

  getTasksBySubTopic(subTopicId: number): Observable<TaskModel[]> {
    return this.http.get<TaskModel[]>(`${environment.apiUrl}/Task/SubTopic/${subTopicId}`);
  }

  createTask(payload: { subTopicId: number | null; taskTitle: string; description?: string; resourceURL?: string; dueDate?: string | null }): Observable<{ taskId: number }> {
    return this.http.post<{ taskId: number }>(`${environment.apiUrl}/Task`, payload);
  }

  updateTask(taskId: number, payload: { taskTitle: string; description?: string; resourceURL?: string; dueDate?: string | null }): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/Task/${taskId}`, payload);
  }

  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/Task/${taskId}`);
  }

  getNotesBySubTopic(subTopicId: number): Observable<Note[]> {
    return this.http.get<Note[]>(`${environment.apiUrl}/Notes/subtopic/${subTopicId}`);
  }

  createNote(payload: { subTopicId: number | null; noteTitle: string; content?: string; resourceURL?: string }): Observable<{ noteId: number }> {
    return this.http.post<{ noteId: number }>(`${environment.apiUrl}/Notes`, payload);
  }

  updateNote(noteId: number, payload: { noteTitle: string; content?: string; resourceURL?: string }): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/Notes/${noteId}`, payload);
  }

  deleteNote(noteId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/Notes/${noteId}`);
  }
}
