import { Component, inject } from '@angular/core';
import { TaskService } from '../../services/task.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../core/models/user.model';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-task-form',
    imports: [ReactiveFormsModule, NgClass],
    templateUrl: './task-form.component.html',
    styleUrl: './task-form.component.scss'
})
export class TaskFormComponent {
  taskForm: FormGroup;
  priority: string = 'Medium';
  userId: string = '';
  users: User[] = [];
  minDate: string = new Date().toISOString().split('T')[0];

  router = inject(Router);
  taskService = inject(TaskService);
  auth = inject(AuthService);
  fb = inject(FormBuilder);

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
      deadline: [this.minDate, Validators.required],
      priority: ['', Validators.required],
      userId: ['', Validators.required],
    });
  }

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
    if (this.taskForm.invalid) {
      return;
    }
    const task = {
      title: this.taskForm.value.title,
      description: this.taskForm.value.description,
      deadline: this.taskForm.value.deadline,
      priority: this.taskForm.value.priority,
      userId: this.taskForm.value.userId,
    };

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
