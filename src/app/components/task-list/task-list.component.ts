import { Component, inject, OnInit, signal } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { Task } from '../../core/models/tasks.model';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit {
  tasks = signal<Task[]>([]);
  paginatedTasks = signal<Task[]>([]);
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);
  totalPages = signal<number>(0);
  taskService = inject(TaskService);
  error = signal<string>('');
  loading = signal<boolean>(false);

  constructor() {}

  ngOnInit() {
    this.loadTasks(this.currentPage(), this.itemsPerPage());
  }

  loadTasks(page: number, limit: number) {
    this.loading.set(true);
    this.taskService.getAllTasks(page, limit).subscribe({
      next: (response) => {
        this.tasks.set(response?.data?.tasks || []);
        this.totalPages.set(
          response?.data?.totalPages ||
            Math.ceil(this.tasks().length / this.itemsPerPage())
        );
        this.currentPage.set(response?.data?.currentPage || 1);
        this.updatePaginatedTasks();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error getting tasks:', error);
        this.error.set('Error getting tasks');
        this.loading.set(false);
      },
    });
  }

  updatePaginatedTasks() {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    this.paginatedTasks.set(this.tasks().slice(startIndex, endIndex));
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadTasks(this.currentPage(), this.itemsPerPage());
    } else {
      console.log('No more pages to display.');
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadTasks(this.currentPage(), this.itemsPerPage());
    } else {
      console.log('Already on the first page.');
    }
  }
}
