import { Component, inject, OnInit, signal } from '@angular/core';
import { Task, Subtask } from '../../../core/models/tasks.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { DatePipe, NgClass } from '@angular/common';
import { Location } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { DeadlineAlertPipe } from '../../../shared/pipes/deadline-alert.pipe';
import { ReplacePipe } from '../../../shared/pipes/replace.pipe';

@Component({
    selector: 'app-task-detail',
    imports: [DatePipe, NgClass, RouterLink, DeadlineAlertPipe, ReplacePipe],
    templateUrl: './task-detail.component.html',
})
export class TaskDetailComponent implements OnInit {
  task = signal<Task | null>(null);
  isCompleted = signal<boolean>(false);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  deleting = signal<boolean>(false);
  activities = signal<any[]>([]);

  router = inject(Router);
  taskService = inject(TaskService);
  route = inject(ActivatedRoute);
  location = inject(Location);
  notificationService = inject(NotificationService);

  constructor() {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.loadTaskDetails(id);
      }
    });
  }

  loadTaskDetails(id: string) {
    this.loading.set(true);
    this.taskService.getTaskById(id).subscribe({
      next: (response: any) => {
        this.task.set(response.data);
        this.isCompleted.set(this.task()?.completed || false);
        this.loading.set(false);
        this.loadActivities(id);
      },
      error: (error) => {
        console.error('Error getting task:', error);
        this.notificationService.error(error?.error?.message || 'Error getting task', 'Error');
        this.loading.set(false);
      },
    });
  }

  loadActivities(id: string) {
    this.taskService.getTaskActivities(id).subscribe({
      next: (response) => {
        this.activities.set(response.data);
      },
      error: (error) => {
        console.error('Error loading activities:', error);
      }
    });
  }

  getCompletedSubtasksCount(): number {
    const t = this.task();
    if (!t || !t.subtasks) return 0;
    return t.subtasks.filter((s: Subtask) => s.completed).length;
  }

  getTotalSubtasksCount(): number {
    const t = this.task();
    return t?.subtasks?.length || 0;
  }

  getUserEmail(user: any): string {
    if (!user) return 'Unassigned';
    if (typeof user === 'string') return user;
    return user.email || 'Unassigned';
  }

  goBack(): void {
    // Replace location.back() with direct navigation
    this.router.navigate(['/tasks']);
  }

  completeTask() {
    const t = this.task();
    if (!t || t.completed) {
      return;
    }
    
    this.loading.set(true);
    const taskId = t._id;
    
    // Only update the completed status
    const updatedTask = { completed: true };
    
    this.taskService.updateTask(taskId, updatedTask).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.task.set(response.data);
          this.isCompleted.set(true);
          this.notificationService.success('Task marked as complete!', 'Success');
        } else {
          // If the response format is different, update our local state
          const currentTask = this.task();
          if (currentTask) {
            currentTask.completed = true;
            this.task.set(currentTask);
            this.isCompleted.set(true);
            this.notificationService.success('Task marked as complete!', 'Success');
          }
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error updating task:', error);
        this.notificationService.error(error?.error?.message || 'Error marking task as complete', 'Error');
        this.loading.set(false);
      },
    });
  }

  editTask() {
    const t = this.task();
    if (!t?._id) {
      this.error.set('Cannot edit task: Invalid task ID');
      return;
    }
    this.router.navigate(['/tasks/edit', t._id]);
  }

  deleteTask() {
    const t = this.task();
    if (!t?._id) {
      this.error.set('Cannot delete task: Invalid task ID');
      return;
    }
    
    if (confirm('Are you sure you want to delete this task?')) {
      this.deleting.set(true);
      this.error.set(null);
      
      this.taskService.deleteTask(t._id).subscribe({
        next: (response) => {
          this.notificationService.success('Task deleted successfully.', 'Deleted');
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.notificationService.error(error?.error?.message || 'Error deleting task. Please try again.', 'Error');
          this.deleting.set(false);
        }
      });
    }
  }

  toggleSubtask(subtask: any) {
    const t = this.task();
    if (!t) return;

    const originalValue = subtask.completed;
    subtask.completed = !subtask.completed;
    
    const taskId = t._id;
    const updatedTask = { subtasks: t.subtasks };
    
    this.taskService.updateTask(taskId, updatedTask).subscribe({
      next: (response) => {
        // Success
      },
      error: (error) => {
        console.error('Error updating subtask:', error);
        // Revert local state on error
        subtask.completed = originalValue;
        this.error.set('Failed to update subtask');
      }
    });
  }
}
