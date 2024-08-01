import { Component, inject } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../core/models/users.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent {
  title: string = '';
  description: string = '';
  deadline: string = new Date().toISOString().split('T')[0];
  priority: string = 'Medium';
  userId: string = '';
  users: User[] = [];
  minDate: string = new Date().toISOString().split('T')[0];

  router = inject(Router);
  taskService = inject(TaskService);
  auth = inject(AuthService);

  constructor() {}

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    this.auth.getUsers().subscribe({
      next: (response) => {
        this.users = response;
      },
      error: (error) => {
        console.error('Error getting users:', error);
      },
    });
  }

  createTask() {
    const task = {
      title: this.title,
      description: this.description,
      deadline: this.deadline,
      priority: this.priority,
      userId: this.userId,
    };

    if (
      !task.title ||
      !task.description ||
      !task.deadline ||
      !task.priority ||
      !task.userId
    ) {
      return;
    }

    this.taskService.createTask(task).subscribe({
      next: () => {
        this.router.navigate(['/tasks']);
      },
      error: (error) => {
        console.error('Error creating task:', error);
      },
    });
  }
}
