import { Component, inject, OnInit, signal } from '@angular/core';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../core/models/users.model';

@Component({
    selector: 'app-users-list',
    imports: [],
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {
  users = signal<User[]>([]);
  paginatedUsers = signal<User[]>([]);
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);
  totalPages = signal<number>(0);
  usersService = inject(UsersService);
  error = signal<string>('');
  loading = signal<boolean>(false);

  constructor() {}

  ngOnInit() {
    this.loadUsers(this.currentPage(), this.itemsPerPage());
  }

  loadUsers(page: number, limit: number) {
    this.loading.set(true);
    this.usersService.getUsers(page, limit).subscribe({
      next: (response) => {
        this.users.set(response?.data?.users || []);
        this.totalPages.set(
          response?.data?.totalPages ||
            Math.ceil(this.users().length / this.itemsPerPage())
        );
        this.currentPage.set(response?.data?.currentPage || 1);
        this.updatePaginatedUsers();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error getting users:', error);
        this.error.set('Error getting users');
        this.loading.set(false);
      },
    });
  }

  updatePaginatedUsers() {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    this.paginatedUsers.set(this.users().slice(startIndex, endIndex));
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadUsers(this.currentPage(), this.itemsPerPage());
    } else {
      console.log('No more pages to display.');
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadUsers(this.currentPage(), this.itemsPerPage());
    } else {
      console.log('Already on the first page.');
    }
  }
}
