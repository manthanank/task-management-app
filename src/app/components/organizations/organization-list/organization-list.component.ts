import { Component, inject, OnInit, signal } from '@angular/core';
import { OrganizationService } from '../../../services/organization.service';
import { Organization } from '../../../core/models/organization.model';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-organization-list',
  imports: [RouterLink],
  templateUrl: './organization-list.component.html'
})
export class OrganizationListComponent implements OnInit {
  organizations = signal<Organization[]>([]);
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);
  totalPages = signal<number>(0);
  totalOrganizations = signal<number>(0);
  loading = signal<boolean>(false);
  error = signal<string>('');
  Math = Math;

  organizationService = inject(OrganizationService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.loadOrganizations(this.currentPage(), this.itemsPerPage());
  }

  loadOrganizations(page: number, limit: number) {
    this.loading.set(true);

    const role = this.authService.getCurrentUserRole?.() || 'admin'; // fallback to admin

    let orgsObservable;
    if (role === 'super') {
      orgsObservable = this.organizationService.getAllOrganizations(page, limit);
    } else {
      orgsObservable = this.organizationService.getMyOrganizations(page, limit);
    }

    orgsObservable.subscribe({
      next: (response: any) => {
        if (role === 'super') {
          this.organizations.set(response?.data?.organizations || []);
          this.totalPages.set(response?.data?.totalPages || 1);
          this.currentPage.set(response?.data?.currentPage || 1);
          this.totalOrganizations.set(response?.data?.totalOrganizations || 0);
        } else {
          // Handle single organization response (not paginated)
          const org = response?.organization || response?.data?.organization;
          this.organizations.set(org ? [org] : []);
          this.totalPages.set(1);
          this.currentPage.set(1);
          this.totalOrganizations.set(org ? 1 : 0);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error getting organizations:', error);
        this.error.set('Error loading organizations. Please try again.');
        this.loading.set(false);
      },
    });
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      const nextPageNum = this.currentPage() + 1;
      this.loadOrganizations(nextPageNum, this.itemsPerPage());
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      const prevPageNum = this.currentPage() - 1;
      this.loadOrganizations(prevPageNum, this.itemsPerPage());
    }
  }
}
