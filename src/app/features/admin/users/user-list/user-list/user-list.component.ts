import { Component, OnInit, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Angular Material
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

// Models and Services
import { User } from '../../../../../core/models/user';
import { AuthService } from '../../../../../core/services/auth.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { UserService } from '../../../../../core/services/user.service';

// Components
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog/confirm-dialog.component';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
    ConfirmDialogComponent
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  users: User[] = [];
  dataSource = new MatTableDataSource<User>([]);
  displayedColumns: string[] = ['username', 'fullName', 'email', 'role', 'actions'];
  loading = true;

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  loadUsers(): void {
    this.loading = true;
    
    this.userService.getUsers()
      .pipe(
        finalize(() => this.loading = false),
        catchError(error => {
          this.notificationService.error('Erreur lors du chargement des utilisateurs');
          console.error('Erreur lors du chargement des utilisateurs', error);
          return of([]);
        })
      )
      .subscribe(users => {
        // Vérifier que chaque utilisateur a un ID
        console.log('Utilisateurs reçus:', users);
        
        // S'assurer que tous les utilisateurs ont un ID valide
        const usersWithId = users.filter(user => user && user.id);
        if (usersWithId.length !== users.length) {
          console.warn(`${users.length - usersWithId.length} utilisateurs n'ont pas d'ID valide`);
        }
        
        this.users = usersWithId;
        this.dataSource = new MatTableDataSource(this.users);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteUser(user: User): void {
    if (!user || !user.id) {
      console.error('Tentative de suppression d\'un utilisateur sans ID:', user);
      this.notificationService.error('Impossible de supprimer: données utilisateur incomplètes');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.username}" ? Cette action est irréversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        const userId = user.id; 
        
        this.userService.deleteUser(userId)
          .pipe(
            finalize(() => this.loading = false),
            catchError(error => {
              this.notificationService.error('Erreur lors de la suppression de l\'utilisateur');
              console.error('Erreur lors de la suppression de l\'utilisateur', error);
              return of(null);
            })
          )
          .subscribe(() => {
            this.users = this.users.filter(u => u.id !== userId);
            this.dataSource.data = this.users;
            this.notificationService.success('Utilisateur supprimé avec succès');
          });
      }
    });
  }

  changeRole(user: User): void {
    // Vérification que l'utilisateur et son ID sont définis
    if (!user || !user.id) {
      console.error('Tentative de changement de rôle d\'un utilisateur sans ID:', user);
      this.notificationService.error('Impossible de changer le rôle: données utilisateur incomplètes');
      return;
    }

    const roles = ['ADMIN', 'TEACHER', 'STUDENT'];
    const currentRoleIndex = roles.indexOf(user.role);
    const nextRoleIndex = (currentRoleIndex + 1) % roles.length;
    const newRole = roles[nextRoleIndex];
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Changer le rôle',
        message: `Êtes-vous sûr de vouloir changer le rôle de "${user.username}" de "${this.getRoleDisplayName(user.role)}" à "${this.getRoleDisplayName(newRole)}" ?`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        const userId = user.id; // Stocker l'ID dans une variable locale
        
        this.userService.changeUserRole(userId, newRole)
          .pipe(
            finalize(() => this.loading = false),
            catchError(error => {
              this.notificationService.error('Erreur lors du changement de rôle');
              console.error('Erreur lors du changement de rôle', error);
              return of(null);
            })
          )
          .subscribe(updatedUser => {
            if (updatedUser) {
              const index = this.users.findIndex(u => u.id === userId);
              if (index !== -1) {
                this.users[index].role = newRole;
                this.dataSource.data = [...this.users];
              }
              this.notificationService.success(`Le rôle de "${user.username}" a été changé en "${this.getRoleDisplayName(newRole)}"`);
            }
          });
      }
    });
  }

  resetPassword(user: User): void {
    if (!user || !user.id) {
      console.error('Tentative de réinitialisation de mot de passe d\'un utilisateur sans ID:', user);
      this.notificationService.error('Impossible de réinitialiser le mot de passe: données utilisateur incomplètes');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Réinitialiser le mot de passe',
        message: `Êtes-vous sûr de vouloir réinitialiser le mot de passe de "${user.username}" ? Un nouveau mot de passe sera généré et envoyé par email.`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        const userId = user.id; // Stocker l'ID dans une variable locale
        
        this.userService.resetPassword(userId)
          .pipe(
            finalize(() => this.loading = false),
            catchError(error => {
              this.notificationService.error('Erreur lors de la réinitialisation du mot de passe');
              console.error('Erreur lors de la réinitialisation du mot de passe', error);
              return of(null);
            })
          )
          .subscribe(() => {
            this.notificationService.success(`Un nouveau mot de passe a été envoyé à ${user.email}`);
          });
      }
    });
  }

  isCurrentUser(user: User): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id === user.id;
  }

  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'TEACHER':
        return 'Professeur';
      case 'STUDENT':
        return 'Étudiant';
      default:
        return role;
    }
  }

  getInitials(user: User): string {
    if (!user.firstName || !user.lastName) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
}