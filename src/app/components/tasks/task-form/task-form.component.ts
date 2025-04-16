import { Component, inject } from '@angular/core';
import { TaskService } from '../../../services/task.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../core/models/user.model';
import { NgClass } from '@angular/common';
import { UsersService } from '../../../services/users.service';

@Component({
    selector: 'app-task-form',
    imports: [ReactiveFormsModule, NgClass, RouterLink],
    templateUrl: './task-form.component.html',
})
export class TaskFormComponent {
  taskForm: FormGroup;
  priority: string = 'Medium';
  userId: string = '';
  users: User[] = [];
  minDate: string = new Date().toISOString().split('T')[0];
  loading = { set: (value: boolean) => { /* loading logic */ } };
  error: string = '';
  
  router = inject(Router);
  taskService = inject(TaskService);
  auth = inject(AuthService);
  usersService = inject(UsersService);
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
    this.loadOrganizationUsers();
  }

  loadOrganizationUsers() {
    this.loading.set(true);
    this.usersService.getUsers().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.users = response.data.users || [];
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error = error?.error?.message || 'Error loading users';
        this.loading.set(false);
      }
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
