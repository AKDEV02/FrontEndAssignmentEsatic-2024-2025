import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    notificationService.error('Veuillez vous connecter pour accéder à cette page');
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};