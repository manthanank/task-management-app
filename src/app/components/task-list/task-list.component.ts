import { Component, inject, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { RouterLink } from '@angular/router';
import { Data, Task } from '../../core/models/tasks.models';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent implements OnInit {
  tasks: any;

  taskService = inject(TaskService);

  constructor() {}

  ngOnInit() {
    this.taskService.getAllTasks().subscribe({
      next: (response) => {
        this.tasks = response.data;
      },
      error: (error) => {
        console.error('Error getting tasks:', error);
      },
    });
  }
}
