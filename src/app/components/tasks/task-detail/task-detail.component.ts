import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { DatePipe, NgClass } from '@angular/common';
import { Location } from '@angular/common';

@Component({
    selector: 'app-task-detail',
    imports: [DatePipe, NgClass],
    templateUrl: './task-detail.component.html',
    styleUrl: './task-detail.component.scss'
})
export class TaskDetailComponent implements OnInit {
  task = signal<any>(null);
  isCompleted = signal<boolean>(false);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  router = inject(Router);
  taskService = inject(TaskService);
  route = inject(ActivatedRoute);
  location = inject(Location);

  constructor() {}

  ngOnInit() {
    this.loading.set(true);
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.taskService.getTaskById(id).subscribe({
      next: (response) => {
        this.task.set(response.data);
        this.isCompleted.set(this.task().completed);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error getting task:', error);
        this.error.set('Error getting task');
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  completeTask() {
    if (this.task().completed) {
      return;
    }
    this.task().completed = true;
    this.taskService.updateTask(this.task()._id, this.task()).subscribe({
      next: (response) => {
        this.router.navigate(['/tasks']);
      },
      error: (error) => {
        console.error('Error updating task:', error);
        this.error.set('Error updating task');
      },
    });
  }
}
