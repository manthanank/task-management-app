import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrganizationService } from '../../../services/organization.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-organization-form',
  imports: [ReactiveFormsModule, RouterLink, NgClass],
  templateUrl: './organization-form.component.html'
})
export class OrganizationFormComponent {
  organizationForm: FormGroup;
  error = '';
  loading = false;
  
  private organizationService = inject(OrganizationService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  constructor() {
    this.organizationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      logo: ['']
    });
  }
  
  onSubmit() {
    if (this.organizationForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    this.organizationService.createOrganization(this.organizationForm.value)
      .subscribe({
        next: () => {
          this.router.navigate(['/organizations']);
        },
        error: (error) => {
          console.error('Error creating organization:', error);
          this.error = error?.error?.message || 'Failed to create organization';
          this.loading = false;
        }
      });
  }
}