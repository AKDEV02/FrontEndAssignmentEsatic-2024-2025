import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

// Models and Services
import { Assignment } from '../../../core/models/assignment';
import { Subject } from '../../../core/models/subject';
import { AssignmentsService } from '../../../core/services/assignments.service';
import { SubjectService } from '../../../core/services/subject.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

// Components
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-assignment-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    // ConfirmDialogComponent
  ],
  templateUrl: './assignment-detail.component.html',
  styleUrls: ['./assignment-detail.component.css']
})
export class AssignmentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assignmentsService = inject(AssignmentsService);
  private subjectService = inject(SubjectService);
  public authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  assignment: Assignment | null = null;
  subject: Subject | null = null;
  loading = true;
  error: string | null = null;
  
  ngOnInit(): void {
    this.loadAssignment();
  }

  loadAssignment(): void {
    const assignmentId = this.route.snapshot.paramMap.get('id');
    
    if (!assignmentId) {
      this.notificationService.error('Identifiant d\'assignment invalide');
      this.router.navigate(['/assignments']);
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    this.assignmentsService.getAssignment(assignmentId).subscribe({
      next: (assignment) => {
        this.assignment = assignment;
        
        // Charger les détails de la matière si nécessaire
        if (this.assignment?.matiere) {
          if (typeof this.assignment.matiere === 'string') {
            this.loadSubjectDetails(this.assignment.matiere);
          } else {
            this.subject = this.assignment.matiere;
          }
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'assignment', error);
        this.error = 'Impossible de charger les détails de l\'assignment';
        this.loading = false;
        this.notificationService.error(this.error);
      }
    });
  }

  loadSubjectDetails(subjectId: string): void {
    this.subjectService.getSubject(subjectId).subscribe({
      next: (subject) => {
        this.subject = subject;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des détails de la matière', error);
       // this.notificationService.warning('Impossible de charger les détails de la matière');
      }
    });
  }

  markAsSubmitted(): void {
    if (!this.assignment) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la soumission',
        message: 'Êtes-vous sûr de vouloir marquer cet assignment comme rendu ?',
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.assignment) {
        const updatedAssignment = {
          ...this.assignment,
          rendu: true,
          dateDeRendu: new Date() // Mettre à jour la date de rendu
        };
        
        this.assignmentsService.updateAssignment(updatedAssignment).subscribe({
          next: () => {
            this.notificationService.success('Assignment marqué comme rendu avec succès');
            this.loadAssignment(); // Recharger les données
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour', error);
            this.notificationService.error('Impossible de mettre à jour l\'assignment');
          }
        });
      }
    });
  }

  deleteAssignment(): void {
    if (!this.assignment) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: 'Êtes-vous sûr de vouloir supprimer définitivement cet assignment ?',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.assignment) {
        this.assignmentsService.deleteAssignment(this.assignment.id).subscribe({
          next: () => {
            this.notificationService.success('Assignment supprimé avec succès');
            this.router.navigate(['/assignments']);
          },
          error: (error) => {
            console.error('Erreur lors de la suppression', error);
            this.notificationService.error('Impossible de supprimer l\'assignment');
          }
        });
      }
    });
  }

  editAssignment(): void {
    if (this.assignment) {
      this.router.navigate(['/assignments', this.assignment.id, 'edit']);
    }
  }

  getStatusClass(): string {
    if (!this.assignment) return '';
    
    if (this.assignment.rendu) {
      return 'status-submitted';
    } else {
      const today = new Date();
      const deadline = new Date(this.assignment.dateDeRendu);
      
      if (deadline < today) {
        return 'status-late';
      } else {
        return 'status-pending';
      }
    }
  }

  getStatusText(): string {
    if (!this.assignment) return '';
    
    if (this.assignment.rendu) {
      return 'Rendu';
    } else {
      const today = new Date();
      const deadline = new Date(this.assignment.dateDeRendu);
      
      if (deadline < today) {
        return 'En retard';
      } else {
        return 'À rendre';
      }
    }
  }

  canEdit(): boolean {
    if (!this.assignment) return false;
    return this.authService.isAdmin() || 
           (this.authService.isTeacher() && !this.assignment.rendu);
  }

  canDelete(): boolean {
    return this.authService.isAdmin();
  }

  canMarkAsSubmitted(): boolean {
    if (!this.assignment) return false;
    return this.authService.isStudent() && 
           !this.assignment.rendu && 
           this.assignment.note !== undefined;
  }
}