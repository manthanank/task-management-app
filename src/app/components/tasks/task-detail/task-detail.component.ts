import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { DatePipe, NgClass } from '@angular/common';
import { Location } from '@angular/common';

@Component({
    selector: 'app-task-detail',
    imports: [DatePipe, NgClass, RouterLink],
    templateUrl: './task-detail.component.html',
})
export class TaskDetailComponent implements OnInit {
  task = signal<any>(null);
  isCompleted = signal<boolean>(false);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  deleting = signal<boolean>(false);

  router = inject(Router);
  taskService = inject(TaskService);
  route = inject(ActivatedRoute);
  location = inject(Location);

  constructor() {}

  ngOnInit() {
    this.loading.set(true);
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.loadTaskDetails(id);
  }

  loadTaskDetails(id: string) {
    this.taskService.getTaskById(id).subscribe({
      next: (response) => {
        this.task.set(response.data);
        this.isCompleted.set(this.task()?.completed || false);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error getting task:', error);
        this.error.set(error?.error?.message || 'Error getting task');
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    // Replace location.back() with direct navigation
    this.router.navigate(['/tasks']);
  }

  completeTask() {
    if (!this.task() || this.task().completed) {
      return;
    }
    
    this.loading.set(true);
    const taskId = this.task()._id;
    
    // Only update the completed status
    const updatedTask = { completed: true };
    
    this.taskService.updateTask(taskId, updatedTask).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.task.set(response.data);
          this.isCompleted.set(true);
        } else {
          // If the response format is different, update our local state
          const currentTask = this.task();
          if (currentTask) {
            currentTask.completed = true;
            this.task.set(currentTask);
            this.isCompleted.set(true);
          }
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error updating task:', error);
        this.error.set(error?.error?.message || 'Error marking task as complete');
        this.loading.set(false);
      },
    });
  }

  editTask() {
    if (!this.task()?._id) {
      this.error.set('Cannot edit task: Invalid task ID');
      return;
    }
    this.router.navigate(['/tasks/edit', this.task()._id]);
  }

  deleteTask() {
    if (!this.task()?._id) {
      this.error.set('Cannot delete task: Invalid task ID');
      return;
    }
    
    if (confirm('Are you sure you want to delete this task?')) {
      this.deleting.set(true);
      this.error.set(null);
      
      this.taskService.deleteTask(this.task()._id).subscribe({
        next: (response) => {
          console.log('Task deleted successfully:', response);
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.error.set(error?.error?.message || 'Error deleting task. Please try again.');
          this.deleting.set(false);
        }
      });
    }
  }
}
