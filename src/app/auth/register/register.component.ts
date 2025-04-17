import { Component, inject, signal, OnInit } from '@angular/core';
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
import { OrganizationService } from '../../services/organization.service';
import { Organization } from '../../core/models/organization.model';

@Component({
    selector: 'app-register',
    imports: [ReactiveFormsModule, RouterLink, NgClass],
    templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  error = signal<string>('');
  showPassword = signal<boolean>(false);
  isAdmin = signal<boolean>(false);
  organizations: Organization[] = [];

  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);
  organizationService = inject(OrganizationService);

  constructor() {
    this.registerForm = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20),
      ]),
      organization: new FormControl(''),
      role: new FormControl('user', Validators.required)
    });
  }

  ngOnInit(): void {
    // Initialize the form based on the default role
    this.updateRoleSelection();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((state) => !state);
  }

  updateRoleSelection() {
    const roleControl = this.registerForm.get('role');
    const orgNameControl = this.registerForm.get('organization');

    // Update signals for template
    this.isAdmin.set(roleControl?.value === 'admin');

    // Require organization for admin or super
    if (roleControl?.value === 'admin') {
      orgNameControl?.setValidators([Validators.required]);
    } else {
      orgNameControl?.clearValidators();
    }

    orgNameControl?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const data = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      organization: this.registerForm.value.organization,
      role: this.registerForm.value.role
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
