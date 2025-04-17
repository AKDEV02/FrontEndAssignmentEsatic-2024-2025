import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

// Services
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Output() menuToggle = new EventEmitter<void>();

  constructor(
    public authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  toggleMenu(): void {
    this.menuToggle.emit();
  }

  logout(): void {
    this.authService.logout();
    this.notificationService.success('Vous avez été déconnecté avec succès');
    this.router.navigate(['/auth/login']);
  }
}