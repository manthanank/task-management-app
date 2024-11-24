import { Component, inject, OnInit, signal } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { Task } from '../../core/models/tasks.model';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';

@Component({
    selector: 'app-task-list',
    imports: [RouterLink, NgTemplateOutlet],
    templateUrl: './task-list.component.html',
    styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  completedTasks$ = signal<Task[]>([]);
  pendingTasks = signal<Task[]>([]);

  completedPaginatedTasks = signal<Task[]>([]);
  pendingPaginatedTasks = signal<Task[]>([]);

  completedCurrentPage = signal<number>(1);
  pendingCurrentPage = signal<number>(1);

  completedItemsPerPage = signal<number>(10);
  pendingItemsPerPage = signal<number>(10);

  completedTotalPages = signal<number>(0);
  pendingTotalPages = signal<number>(0);

  taskService = inject(TaskService);

  completedError = signal<string>('');
  pendingError = signal<string>('');

  completedLoading = signal<boolean>(false);
  pendingLoading = signal<boolean>(false);

  constructor() {}

  ngOnInit() {
    // this.loadTasks(this.currentPage(), this.itemsPerPage());
    this.loadCompletedTasks(
      this.completedCurrentPage(),
      this.completedItemsPerPage()
    );
    this.loadPendingTasks(
      this.pendingCurrentPage(),
      this.pendingItemsPerPage()
    );
  }

  loadCompletedTasks(page: number, limit: number) {
    this.completedLoading.set(true);
    this.taskService.getCompletedTasks(page, limit).subscribe({
      next: (response) => {
        this.completedTasks$.set(response?.data?.tasks || []);
        this.completedTotalPages.set(
          response?.data?.totalPages ||
            Math.ceil(
              this.completedTasks$().length / this.completedItemsPerPage()
            )
        );
        this.completedCurrentPage.set(response?.data?.currentPage || 1);
        this.updateCompletedPaginatedTasks();
        this.completedLoading.set(false);
      },
      error: (error) => {
        console.error('Error getting completed tasks:', error);
        this.completedError.set('Error getting completed tasks');
        this.completedLoading.set(false);
      },
    });
  }

  loadPendingTasks(page: number, limit: number) {
    this.pendingLoading.set(true);
    this.taskService.getPendingTasks(page, limit).subscribe({
      next: (response) => {
        this.pendingTasks.set(response?.data?.tasks || []);
        this.pendingTotalPages.set(
          response?.data?.totalPages ||
            Math.ceil(this.pendingTasks().length / this.pendingItemsPerPage())
        );
        this.pendingCurrentPage.set(response?.data?.currentPage || 1);
        this.updatePendingPaginatedTasks();
        this.pendingLoading.set(false);
      },
      error: (error) => {
        console.error('Error getting pending tasks:', error);
        this.pendingError.set('Error getting pending tasks');
        this.pendingLoading.set(false);
      },
    });
  }

  updateCompletedPaginatedTasks() {
    const startIndex =
      (this.completedCurrentPage() - 1) * this.completedItemsPerPage();
    const endIndex = startIndex + this.completedItemsPerPage();
    this.completedPaginatedTasks.set(
      this.completedTasks$().slice(startIndex, endIndex)
    );
  }

  updatePendingPaginatedTasks() {
    const startIndex =
      (this.pendingCurrentPage() - 1) * this.pendingItemsPerPage();
    const endIndex = startIndex + this.pendingItemsPerPage();
    this.pendingPaginatedTasks.set(
      this.pendingTasks().slice(startIndex, endIndex)
    );
  }

  nextCompletedPage() {
    if (this.completedCurrentPage() < this.completedTotalPages()) {
      this.completedCurrentPage.set(this.completedCurrentPage() + 1);
      this.loadCompletedTasks(
        this.completedCurrentPage(),
        this.completedItemsPerPage()
      );
    } else {
      console.log('No more pages to display.');
    }
  }

  nextPendingPage() {
    if (this.pendingCurrentPage() < this.pendingTotalPages()) {
      this.pendingCurrentPage.set(this.pendingCurrentPage() + 1);
      this.loadPendingTasks(
        this.pendingCurrentPage(),
        this.pendingItemsPerPage()
      );
    } else {
      console.log('No more pages to display.');
    }
  }

  previousCompletedPage() {
    if (this.completedCurrentPage() > 1) {
      this.completedCurrentPage.set(this.completedCurrentPage() - 1);
      this.loadCompletedTasks(
        this.completedCurrentPage(),
        this.completedItemsPerPage()
      );
    } else {
      console.log('Already on the first page.');
    }
  }

  previousPendingPage() {
    if (this.pendingCurrentPage() > 1) {
      this.pendingCurrentPage.set(this.pendingCurrentPage() - 1);
      this.loadPendingTasks(
        this.pendingCurrentPage(),
        this.pendingItemsPerPage()
      );
    } else {
      console.log('Already on the first page.');
    }
  }
}
