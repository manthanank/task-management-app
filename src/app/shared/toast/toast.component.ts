import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Toast } from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  notificationService = inject(NotificationService);
  toasts = this.notificationService.toasts;

  remove(id: number) {
    this.notificationService.remove(id);
  }

  getIcon(type: Toast['type']): string {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-exclamation-circle';
      case 'warning': return 'fa-exclamation-triangle';
      default: return 'fa-info-circle';
    }
  }

  getColorClass(type: Toast['type']): string {
    switch (type) {
      case 'success': return 'bg-green-50 text-green-800 border-green-100';
      case 'error': return 'bg-red-50 text-red-800 border-red-100';
      case 'warning': return 'bg-yellow-50 text-yellow-800 border-yellow-100';
      default: return 'bg-blue-50 text-blue-800 border-blue-100';
    }
  }

  getIconColorClass(type: Toast['type']): string {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-blue-500';
    }
  }
}
