import { Component, inject, OnInit, signal } from '@angular/core';
import { TaskService } from '../../../services/task.service';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../core/models/user.model';
import { NgClass } from '@angular/common';
import { UsersService } from '../../../services/users.service';
import { NotificationService } from '../../../services/notification.service';

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

  
  router = inject(Router);
  taskService = inject(TaskService);
  auth = inject(AuthService);
  usersService = inject(UsersService);
  fb = inject(FormBuilder);
  notificationService = inject(NotificationService);

  loading = signal<boolean>(false);
  error = signal<string>('');

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
      deadline: [this.minDate, Validators.required],
      priority: ['', Validators.required],
      userId: ['', Validators.required],
      subtasks: this.fb.array([])
    });
  }

  get subtasks() {
    return this.taskForm.get('subtasks') as FormArray;
  }

  addSubtask() {
    this.subtasks.push(this.fb.group({
      title: ['', Validators.required],
      completed: [false]
    }));
  }

  removeSubtask(index: number) {
    this.subtasks.removeAt(index);
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
      subtasks: this.taskForm.value.subtasks
    };

    this.loading.set(true);
    this.taskService.createTask(task).subscribe({
      next: () => {
        this.notificationService.success('Task created successfully! Your team has been notified.', 'Task Created');
        this.router.navigate(['/tasks']);
      },
      error: (error) => {
        console.error('Error creating task:', error);
        this.notificationService.error(error?.error?.message || 'Failed to create task. Please try again.', 'Error');
        this.loading.set(false);
      },
    });
  }
}
