import { Component, inject, OnInit, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-reset-password',
    imports: [ReactiveFormsModule, RouterLink, NgClass],
    templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup = new FormGroup({});
  token: string;
  error = signal<string>('');

  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  constructor() {
    this.token = this.route.snapshot.paramMap.get('token')!;
  }

  ngOnInit(): void {
    this.resetPasswordForm = new FormGroup({
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20)
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    });
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid) {
      return;
    }
    
    if (
      this.resetPasswordForm.value.password !==
      this.resetPasswordForm.value.confirmPassword
    ) {
      this.error.set('Passwords do not match');
      return;
    }

    this.authService
      .resetPassword(this.token, this.resetPasswordForm.value.password)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error(err);
          this.error.set(err?.error?.message || 'Password reset failed. Please try again.');
        },
      });
  }
}
