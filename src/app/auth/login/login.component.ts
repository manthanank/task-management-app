import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { LoaderComponent } from '../../shared/loader/loader.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgClass, LoaderComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  error = signal<string>('');
  showPassword = signal<boolean>(false);
  loading = signal<boolean>(false);

  router = inject(Router);
  authService = inject(AuthService);
  fb = inject(FormBuilder);

  constructor() {
    this.loginForm = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20),
      ]),
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((state) => !state);
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
    this.loading.set(true);
    const data = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };
    this.authService.login(data).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        this.loading.set(false);
        console.error(err);
        this.error.set(err?.error?.message || 'An error occurred');
      },
    });
  }
}
