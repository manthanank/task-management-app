import { Component, inject, OnInit, signal } from '@angular/core';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../core/models/users.model';
import { NgClass } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-users-list',
    imports: [NgClass],
    templateUrl: './users-list.component.html',
})
export class UsersListComponent implements OnInit {
  users = signal<User[]>([]);
  paginatedUsers = signal<User[]>([]);
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);
  totalPages = signal<number>(0);
  totalUsers = signal<number>(0);
  loading = signal<boolean>(false);
  error = signal<string>('');

  Math = Math;

  private usersService = inject(UsersService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.loadUsers(this.currentPage(), this.itemsPerPage());
  }

  loadUsers(page: number, limit: number) {
    this.loading.set(true);
    const role = this.authService.getCurrentUserRole?.() || 'admin';

    let usersObservable;
    if (role === 'super') {
      usersObservable = this.usersService.getAllUsers(page, limit);
    } else {
      usersObservable = this.usersService.getUsersByOrganization(page, limit);
    }

    usersObservable.subscribe({
      next: (response) => {
        this.users.set(response?.data?.users || []);
        this.totalPages.set(response?.data?.totalPages || 1);
        this.currentPage.set(response?.data?.currentPage || 1);
        this.totalUsers.set(response?.data?.totalUsers || 0);
        this.paginatedUsers.set(response?.data?.users || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error getting users:', error);
        this.error.set('Error getting users');
        this.loading.set(false);
      },
    });
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.loadUsers(this.currentPage() + 1, this.itemsPerPage());
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.loadUsers(this.currentPage() - 1, this.itemsPerPage());
    }
  }
}
