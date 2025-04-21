import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';

// Services and Models
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { User } from '../../../core/models/user';

// Components
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDividerModule,
    FileUploadComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private fileUploadService = inject(FileUploadService);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  currentUser: User | null = null;
  loading = false;
  passwordLoading = false;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    this.initForms();
  }

  initForms(): void {
    this.profileForm = this.formBuilder.group({
      firstName: [this.currentUser?.firstName || '', Validators.required],
      lastName: [this.currentUser?.lastName || '', Validators.required],
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]],
      username: [this.currentUser?.username || '', [Validators.required, Validators.minLength(3)]]
    });

    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmitProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    const userData = this.profileForm.value;
    
    this.authService.updateProfile(userData).subscribe({
      next: (updatedUser) => {
        this.notificationService.success('Profil mis à jour avec succès');
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du profil', error);
        this.notificationService.error(error.error?.message || 'Échec de la mise à jour du profil');
        this.loading = false;
      }
    });
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.passwordLoading = true;
    const passwordData = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };
    
    // Simulate API call for password change
    setTimeout(() => {
      this.notificationService.success('Mot de passe mis à jour avec succès');
      this.passwordLoading = false;
      this.passwordForm.reset();
    }, 1000);
    
  }

  onPhotoUploaded(fileUrls: string[]): void {
    if (fileUrls && fileUrls.length > 0) {
      const photoUrl = fileUrls[0];
      
      this.authService.updateProfile({ photoUrl }).subscribe({
        next: () => {
          this.notificationService.success('Photo de profil mise à jour avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de la photo de profil', error);
          this.notificationService.error('Échec de la mise à jour de la photo de profil');
        }
      });
    }
  }

  getFullName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  getRoleDisplayName(): string {
    if (!this.currentUser) return '';
    
    switch (this.currentUser.role) {
      case 'ADMIN': return 'Administrateur';
      case 'TEACHER': return 'Professeur';
      case 'STUDENT': return 'Étudiant';
      default: return this.currentUser.role;
    }
  }
}