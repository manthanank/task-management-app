import { Component, inject, OnInit, signal } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { RouterLink } from '@angular/router';
import { Task } from '../../core/models/tasks.models';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent implements OnInit {
  tasks = signal<Task[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  taskService = inject(TaskService);

  constructor() {}

  ngOnInit() {
    this.loading.set(true);
    this.taskService.getAllTasks().subscribe({
      next: (response) => {
        this.tasks.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error getting tasks:', error);
        this.error.set('Error getting tasks');
        this.loading.set(false);
      },
    });
  }
}
