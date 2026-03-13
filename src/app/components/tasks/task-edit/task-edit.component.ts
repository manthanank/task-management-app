import { Component, inject, OnInit } from '@angular/core';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { User } from '../../../core/models/user.model';
import { NgClass } from '@angular/common';
import { UsersService } from '../../../services/users.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-task-edit',
  imports: [ReactiveFormsModule, RouterLink, NgClass],
  templateUrl: './task-edit.component.html',
})
export class TaskEditComponent implements OnInit {
  taskForm: FormGroup;
  taskId: string = '';
  loading = false;
  error: string | null = null;
  minDate: string = new Date().toISOString().split('T')[0];
  users: User[] = [];
  isloading = { set: (value: boolean) => { this.loading = value; } };
  iserror: string | null = null;

  router = inject(Router);
  route = inject(ActivatedRoute);
  taskService = inject(TaskService);
  auth = inject(AuthService);
  fb = inject(FormBuilder);
  usersService = inject(UsersService);
  notificationService = inject(NotificationService);

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
      deadline: ['', Validators.required],
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
    this.taskId = this.route.snapshot.paramMap.get('id') || '';
    this.loading = true;
    
    // Load task details
    this.taskService.getTaskById(this.taskId).subscribe({
      next: (response) => {
        const task = response.data;
        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          deadline: new Date(task.deadline).toISOString().split('T')[0],
          priority: task.priority,
          userId: task.user._id,
        });

        // Load subtasks
        if (task.subtasks && task.subtasks.length > 0) {
          const subtasksFormArray = this.subtasks;
          subtasksFormArray.clear();
          task.subtasks.forEach((subtask: any) => {
            subtasksFormArray.push(this.fb.group({
              title: [subtask.title, Validators.required],
              completed: [subtask.completed]
            }));
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading task:', error);
        this.error = 'Error loading task details';
        this.loading = false;
      }
    });

    // Load users for assignment
    this.getUsers();

    this.loadOrganizationUsers();
  }

  loadOrganizationUsers() {
    this.isloading.set(true);
    this.usersService.getUsersByOrganization().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.users = response.data.users || [];
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.iserror = error?.error?.message || 'Error loading users';
      }
    });
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

  updateTask() {
    if (this.taskForm.invalid) {
      return;
    }

    const updatedTask = {
      title: this.taskForm.value.title,
      description: this.taskForm.value.description,
      deadline: this.taskForm.value.deadline,
      priority: this.taskForm.value.priority,
      userId: this.taskForm.value.userId,
      subtasks: this.taskForm.value.subtasks
    };

    this.loading = true;
    this.taskService.updateTask(this.taskId, updatedTask).subscribe({
      next: () => {
        this.notificationService.success('Task updated successfully!', 'Updated');
        this.router.navigate(['/tasks', this.taskId]);
      },
      error: (error) => {
        console.error('Error updating task:', error);
        this.notificationService.error(error?.error?.message || 'Failed to update task', 'Error');
        this.loading = false;
      },
    });
  }
}