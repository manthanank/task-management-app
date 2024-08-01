import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./components/task-list/task-list.component').then(
        (m) => m.TaskListComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'tasks/new',
    loadComponent: () =>
      import('./components/task-form/task-form.component').then(
        (m) => m.TaskFormComponent
      ),
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'tasks/:id',
    loadComponent: () =>
      import('./components/task-detail/task-detail.component').then(
        (m) => m.TaskDetailComponent
      ),
    canActivate: [AuthGuard],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
