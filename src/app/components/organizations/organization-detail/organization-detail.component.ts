import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrganizationService } from '../../../services/organization.service';
import { Organization } from '../../../core/models/organization.model';
import { NgClass, DatePipe } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../core/models/users.model';

@Component({
  selector: 'app-organization-detail',
  imports: [RouterLink, NgClass, DatePipe, ReactiveFormsModule],
  templateUrl: './organization-detail.component.html'
})
export class OrganizationDetailComponent implements OnInit {
  organization = signal<Organization | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  deleting = signal<boolean>(false);
  editMode = signal<boolean>(false);
  organizationForm: FormGroup;
  addMemberForm: FormGroup;
  showAddMemberModal = signal<boolean>(false);
  availableUsers = signal<User[]>([]);
  loadingUsers = signal<boolean>(false);
  
  private organizationService = inject(OrganizationService);
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  constructor() {
    this.organizationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      logo: ['']
    });
    
    this.addMemberForm = this.fb.group({
      userId: ['', Validators.required],
      role: ['member', Validators.required]
    });
  }
  
  ngOnInit() {
    this.loading.set(true);
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.loadOrganizationDetails(id);
  }
  
  loadOrganizationDetails(id: string) {
    this.organizationService.getOrganizationById(id).subscribe({
      next: (response) => {
        this.organization.set(response.data);
        this.updateFormValues();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error getting organization:', error);
        this.error.set(error?.error?.message || 'Error getting organization');
        this.loading.set(false);
      },
    });
  }
  
  updateFormValues() {
    const org = this.organization();
    if (org) {
      this.organizationForm.patchValue({
        name: org.name || '',
        description: org.description || '',
        logo: org.logo || ''
      });
    }
  }
  
  toggleEditMode() {
    this.editMode.update(value => !value);
    if (!this.editMode()) {
      this.updateFormValues();
    }
  }
  
  saveChanges() {
    if (this.organizationForm.invalid || !this.organization()) {
      return;
    }
    
    this.loading.set(true);
    
    this.organizationService.updateOrganization(
      this.organization()!._id,
      this.organizationForm.value
    ).subscribe({
      next: (response) => {
        this.organization.set(response.data);
        this.editMode.set(false);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error updating organization:', error);
        this.error.set(error?.error?.message || 'Error updating organization');
        this.loading.set(false);
      },
    });
  }
  
  deleteOrganization() {
    if (!this.organization()) {
      this.error.set('Cannot delete organization: Invalid organization ID');
      return;
    }
    
    if (confirm('Are you sure you want to delete this organization?')) {
      this.deleting.set(true);
      this.error.set(null);
      
      this.organizationService.deleteOrganization(this.organization()!._id).subscribe({
        next: () => {
          this.router.navigate(['/organizations']);
        },
        error: (error) => {
          console.error('Error deleting organization:', error);
          this.error.set(error?.error?.message || 'Error deleting organization');
          this.deleting.set(false);
        }
      });
    }
  }
  
  openAddMemberModal() {
    this.showAddMemberModal.set(true);
    this.loadUsers();
  }
  
  closeAddMemberModal() {
    this.showAddMemberModal.set(false);
    this.addMemberForm.reset({ role: 'member' });
  }
  
  loadUsers() {
    this.loadingUsers.set(true);
    this.usersService.getUsersByOrganization().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.availableUsers.set(response.data.users || []);
        }
        this.loadingUsers.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error.set(error?.error?.message || 'Error loading users');
        this.loadingUsers.set(false);
      }
    });
  }
  
  addMember() {
    if (this.addMemberForm.invalid || !this.organization()) {
      return;
    }
    
    const { userId, role } = this.addMemberForm.value;
    
    this.organizationService.addMember(
      this.organization()!._id,
      userId,
      role
    ).subscribe({
      next: (response) => {
        this.organization.set(response.data);
        this.closeAddMemberModal();
      },
      error: (error) => {
        console.error('Error adding member:', error);
        this.error.set(error?.error?.message || 'Error adding member');
      }
    });
  }
  
  removeMember(userId: string) {
    if (!this.organization()) return;
    
    if (confirm('Are you sure you want to remove this member?')) {
      this.organizationService.removeMember(
        this.organization()!._id,
        userId
      ).subscribe({
        next: (response) => {
          this.organization.set(response.data);
        },
        error: (error) => {
          console.error('Error removing member:', error);
          this.error.set(error?.error?.message || 'Error removing member');
        }
      });
    }
  }
  
  isOwner(): boolean {
    const org = this.organization();
    if (!org || !org.owner) return false;
    
    const currentUserId = this.authService.getCurrentUserId();
    return org.owner._id === currentUserId;
  }
  
  isAdmin(): boolean {
    const org = this.organization();
    if (!org || !org.members) return false;
    
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) return false;
    
    if (org.owner && org.owner._id === currentUserId) return true;
    
    const memberRecord = org.members.find(
      m => m.user && m.user._id === currentUserId
    );
    
    return memberRecord?.role === 'admin' || this.isOwner();
  }
}