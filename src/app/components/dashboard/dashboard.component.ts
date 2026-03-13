import { Component, inject, OnInit, signal } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { NgClass, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [NgClass, DecimalPipe, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  stats = signal<any>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  taskService = inject(TaskService);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);
    this.taskService.getTaskStats().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.stats.set(response.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.error.set('Failed to load dashboard statistics');
        this.loading.set(false);
      }
    });
  }

  getCompletionPercentage(): number {
    const s = this.stats();
    if (!s || s.total === 0) return 0;
    return (s.completed / s.total) * 100;
  }
}
