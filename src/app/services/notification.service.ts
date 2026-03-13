import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  toasts = signal<Toast[]>([]);
  private nextId = 0;

  show(message: string, type: Toast['type'] = 'info', title?: string) {
    const id = this.nextId++;
    const toast: Toast = { id, message, type, title };
    this.toasts.update(t => [...t, toast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      this.remove(id);
    }, 5000);
  }

  success(message: string, title: string = 'Success') {
    this.show(message, 'success', title);
  }

  error(message: string, title: string = 'Error') {
    this.show(message, 'error', title);
  }

  info(message: string, title: string = 'Notification') {
    this.show(message, 'info', title);
  }

  warning(message: string, title: string = 'Warning') {
    this.show(message, 'warning', title);
  }

  remove(id: number) {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
