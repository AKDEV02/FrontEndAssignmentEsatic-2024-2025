import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  
  const token = authService.getToken();
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        notificationService.error('Votre session a expiré. Veuillez vous reconnecter.');
        authService.logout();
        router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        notificationService.error('Vous n\'êtes pas autorisé à effectuer cette action');
      } else if (error.status === 500) {
        notificationService.error('Une erreur serveur s\'est produite. Veuillez réessayer plus tard.');
      } else if (error.status === 0) {
        notificationService.error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      }
      
      return throwError(() => error);
    })
  );
};