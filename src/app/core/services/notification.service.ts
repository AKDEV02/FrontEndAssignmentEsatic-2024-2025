// src/app/core/services/notification.service.ts
import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  error(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  info(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}