import { Component, inject, OnInit } from '@angular/core';
import { TaskService } from '../../../services/task.service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { User } from '../../../core/models/user.model';
import { NgClass } from '@angular/common';
import { UsersService } from '../../../services/users.service';
import { NotificationService } from '../../../services/notification.service';
import { AiService } from '../../../services/ai.service';

@Component({
  selector: 'app-task-edit',
  imports: [ReactiveFormsModule, RouterLink, NgClass],
  templateUrl: './task-edit.component.html',
})
export class TaskEditComponent implements OnInit {
  taskForm: FormGroup;
  taskId: string = '';
  loading = false;
  usersLoading = false;
  error: string | null = null;
  minDate: string = new Date().toISOString().split('T')[0];
  users: User[] = [];
  usersError: string | null = null;
  aiLoading = { subtasks: false, description: false, priority: false };

  router = inject(Router);
  route = inject(ActivatedRoute);
  taskService = inject(TaskService);
  fb = inject(FormBuilder);
  usersService = inject(UsersService);
  notificationService = inject(NotificationService);
  aiService = inject(AiService);

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
    
    this.taskService.getTaskById(this.taskId).subscribe({
      next: (response) => {
        const task = response.data;
        let deadlineFormatted = '';
        if (task.deadline) {
          try {
            deadlineFormatted = new Date(task.deadline).toISOString().split('T')[0];
          } catch (e) {
            deadlineFormatted = '';
          }
        }

        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          deadline: deadlineFormatted,
          priority: task.priority,
          userId: task.user?._id || task.user || '',
        });

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

    this.loadOrganizationUsers();
  }

  loadOrganizationUsers() {
    this.usersLoading = true;
    this.usersService.getUsersByOrganization().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.users = response.data.users || [];
        }
        this.usersLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.usersError = error?.error?.message || 'Error loading users';
        this.usersLoading = false;
      }
    });
  }

  aiSuggestSubtasks() {
    const title = this.taskForm.get('title')?.value;
    if (!title) {
      this.notificationService.warning('Please enter a task title first.', 'AI');
      return;
    }
    const description = this.taskForm.get('description')?.value;
    this.aiLoading.subtasks = true;

    this.aiService.suggestSubtasks(title, description).subscribe({
      next: (response) => {
        const subtasksArray = this.subtasks;
        for (const st of response.data.subtasks) {
          subtasksArray.push(this.fb.group({ title: [st, Validators.required], completed: [false] }));
        }
        this.aiLoading.subtasks = false;
        this.notificationService.success(`Added ${response.data.subtasks.length} AI-suggested subtasks.`, 'AI');
      },
      error: () => {
        this.aiLoading.subtasks = false;
        this.notificationService.error('Failed to get AI suggestions.', 'AI Error');
      }
    });
  }

  aiImproveDescription() {
    const title = this.taskForm.get('title')?.value;
    if (!title) {
      this.notificationService.warning('Please enter a task title first.', 'AI');
      return;
    }
    const description = this.taskForm.get('description')?.value;
    this.aiLoading.description = true;

    this.aiService.improveDescription(title, description).subscribe({
      next: (response) => {
        this.taskForm.patchValue({ description: response.data.description });
        this.aiLoading.description = false;
        this.notificationService.success('Description improved by AI.', 'AI');
      },
      error: () => {
        this.aiLoading.description = false;
        this.notificationService.error('Failed to improve description.', 'AI Error');
      }
    });
  }

  aiSuggestPriority() {
    const title = this.taskForm.get('title')?.value;
    if (!title) {
      this.notificationService.warning('Please enter a task title first.', 'AI');
      return;
    }
    const description = this.taskForm.get('description')?.value;
    const deadline = this.taskForm.get('deadline')?.value;
    this.aiLoading.priority = true;

    this.aiService.suggestPriority(title, description, deadline).subscribe({
      next: (response) => {
        this.taskForm.patchValue({ priority: response.data.priority });
        this.aiLoading.priority = false;
        this.notificationService.info(`AI suggests ${response.data.priority} priority: ${response.data.reason}`, 'AI');
      },
      error: () => {
        this.aiLoading.priority = false;
        this.notificationService.error('Failed to suggest priority.', 'AI Error');
      }
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