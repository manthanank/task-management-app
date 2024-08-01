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

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgClass],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  registerForm: FormGroup;
  error = signal<string>('');
  showPassword = signal<boolean>(false);

  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);

  constructor() {
    this.registerForm = this.fb.group({
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
    if (this.registerForm.invalid) {
      return;
    }
    const data = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    };
    this.authService.register(data).subscribe({
      next: () => {
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        console.error(err);
        this.error.set(err?.error?.message || 'An error occurred');
      },
    });
  }
}
