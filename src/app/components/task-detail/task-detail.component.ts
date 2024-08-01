import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { DatePipe } from '@angular/common';
import { Location } from '@angular/common';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss',
})
export class TaskDetailComponent implements OnInit {
  task: any;
  isCompleted: boolean = false;

  router = inject(Router);
  taskService = inject(TaskService);
  route = inject(ActivatedRoute);
  location = inject(Location);

  constructor() {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.taskService.getTaskById(id).subscribe({
      next: (response) => {
        this.task = response.data;
        this.isCompleted = this.task.completed;
      },
      error: (error) => {
        console.error('Error getting task:', error);
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  completeTask() {
    if (this.task.completed) {
      return;
    }
    this.task.completed = true;
    this.taskService.updateTask(this.task._id, this.task).subscribe({
      next: (response) => {
        this.router.navigate(['/tasks']);
      },
      error: (error) => {
        console.error('Error updating task:', error);
      },
    });
  }
}
