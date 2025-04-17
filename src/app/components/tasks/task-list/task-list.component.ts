import { Component, inject, OnInit, signal } from '@angular/core';
import { TaskService } from '../../../services/task.service';
import { Task } from '../../../core/models/tasks.model';
import { RouterLink } from '@angular/router';
import { NgClass, DatePipe } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-task-list',
    imports: [RouterLink, NgClass, DatePipe],
    templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit {
  // Change the name to be consistent (remove $ suffix)
  completedTasks = signal<Task[]>([]);
  pendingTasks = signal<Task[]>([]);

  completedPaginatedTasks = signal<Task[]>([]);
  pendingPaginatedTasks = signal<Task[]>([]);

  completedCurrentPage = signal<number>(1);
  pendingCurrentPage = signal<number>(1);

  completedItemsPerPage = signal<number>(10);
  pendingItemsPerPage = signal<number>(10);

  completedTotalPages = signal<number>(0);
  pendingTotalPages = signal<number>(0);

  completedTotalTasks = signal<number>(0); // Add signal for total completed tasks
  pendingTotalTasks = signal<number>(0);   // Add signal for total pending tasks

  taskService = inject(TaskService);
  auth = inject(AuthService);

  completedError = signal<string>('');
  pendingError = signal<string>('');

  completedLoading = signal<boolean>(false);
  pendingLoading = signal<boolean>(false);

  constructor() {}

  ngOnInit() {
    this.loadUserTasks(this.pendingCurrentPage(), this.pendingItemsPerPage());
  }

  loadCompletedTasks(page: number, limit: number) {
    this.completedLoading.set(true);
    this.taskService.getCompletedTasks(page, limit).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          // Set the tasks directly from the response
          this.completedTasks.set(response.data.tasks || []);
          this.completedTotalPages.set(response.data.totalPages || 1);
          this.completedCurrentPage.set(response.data.currentPage || 1);
          this.completedTotalTasks.set(response.data.totalTasks || 0);

          // No need to call updateCompletedPaginatedTasks() here
          // as we're directly using the paginated data from the API
          this.completedPaginatedTasks.set(response.data.tasks || []);
        } else {
          this.completedError.set('Invalid response format from server');
        }

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
        if (response.status === 'success' && response.data) {
          this.pendingTasks.set(response.data.tasks || []);
          this.pendingTotalPages.set(response.data.totalPages || 1);
          this.pendingCurrentPage.set(response.data.currentPage || 1);
          this.pendingTotalTasks.set(response.data.totalTasks || 0);

          // Directly set the paginated tasks from the API response
          this.pendingPaginatedTasks.set(response.data.tasks || []);
        } else {
          this.pendingError.set('Invalid response format from server');
        }

        this.pendingLoading.set(false);
      },
      error: (error) => {
        console.error('Error getting pending tasks:', error);
        this.pendingError.set('Error getting pending tasks');
        this.pendingLoading.set(false);
      },
    });
  }

  loadUserTasks(page: number, limit: number) {
    this.pendingLoading.set(true);
    this.taskService.getUserTasks(page, limit).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.pendingTasks.set(response.data.tasks || []);
          this.pendingTotalPages.set(response.data.totalPages || 1);
          this.pendingCurrentPage.set(response.data.currentPage || 1);
          this.pendingTotalTasks.set(response.data.totalTasks || 0);
          this.pendingPaginatedTasks.set(response.data.tasks || []);
        } else {
          this.pendingError.set('Invalid response format from server');
        }
        this.pendingLoading.set(false);
      },
      error: (error) => {
        console.error('Error getting user tasks:', error);
        this.pendingError.set('Error getting user tasks');
        this.pendingLoading.set(false);
      },
    });
  }

  // These methods are not currently needed since we're using server-side pagination
  // but kept for potential client-side pagination fallback
  updateCompletedPaginatedTasks() {
    const startIndex =
      (this.completedCurrentPage() - 1) * this.completedItemsPerPage();
    const endIndex = startIndex + this.completedItemsPerPage();
    // Update to use the renamed signal
    this.completedPaginatedTasks.set(
      this.completedTasks().slice(startIndex, endIndex)
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

  refreshData() {
    this.pendingLoading.set(true);
    this.completedLoading.set(true);
    this.pendingError.set('');
    this.completedError.set('');

    this.loadCompletedTasks(this.completedCurrentPage(), this.completedItemsPerPage());
    this.loadPendingTasks(this.pendingCurrentPage(), this.pendingItemsPerPage());
  }

  isAdmin() {
    return this.auth.isAdmin();
  }

  isSuperAdmin() {
    return this.auth.isSuper();
  }
}
