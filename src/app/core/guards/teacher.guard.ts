import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const TeacherGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  if (authService.isLoggedIn() && authService.getCurrentUser()?.role === 'TEACHER') {
    return true;
  } else {
    notificationService.error('Accès réservé aux professeurs');
    router.navigate(['/dashboard']);
    return false;
  }
};