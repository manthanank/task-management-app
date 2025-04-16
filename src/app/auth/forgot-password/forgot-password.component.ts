import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-forgot-password',
    imports: [ReactiveFormsModule, RouterLink, NgClass],
    templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup = new FormGroup({});
  error = signal<string>('');
  success = signal<string>('');

  authService = inject(AuthService);
  router = inject(Router);

  constructor() {}

  ngOnInit() {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    
    this.authService
      .forgotPassword(this.forgotPasswordForm.value.email)
      .subscribe({
        next: (res) => {
          this.success.set('Password reset link has been sent to your email address.');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (err) => {
          console.error(err);
          this.error.set(err?.error?.message || 'Failed to send reset email. Please try again.');
        },
      });
  }
}
