import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [DatePipe],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  profile = signal<any>(null);
  loading = signal<boolean>(true);
  error = signal<string>('');
  usersService = inject(UsersService);
  auth = inject(AuthService);

  ngOnInit() {
    this.getProfile();
  }

  getProfile() {
    this.loading.set(true);
    this.usersService.getProfile().subscribe({
      next: (res) => {
        this.profile.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to load profile');
        this.loading.set(false);
      },
    });
  }
}