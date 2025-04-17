import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

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
  selector: 'app-teacher-assignments',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatDialogModule
  ],
  templateUrl: './teacher-assignments.component.html',
  styleUrls: ['./teacher-assignments.component.css']
})
export class TeacherAssignmentsComponent implements OnInit {
  private assignmentsService = inject(AssignmentsService);
  private subjectService = inject(SubjectService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);

  assignments: Assignment[] = [];
  teacherSubjects: Subject[] = [];
  filteredSubjectId: string = '';
  
  // Pour le tableau
  dataSource: any = [];
  displayedColumns: string[] = ['nom', 'matiere', 'dateDeRendu', 'auteur', 'rendu', 'note', 'actions'];
  
  // Pour la pagination
  totalItems = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  currentPage = 0;
  
  loading = true;

  ngOnInit(): void {
    // Vérifier si on a un filtrage par matière dans l'URL
    this.route.queryParams.subscribe(params => {
      if (params['subject']) {
        this.filteredSubjectId = params['subject'];
      }
    });
    
    this.loadTeacherSubjects();
  }

  loadTeacherSubjects(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;
    
    this.subjectService.getSubjects().subscribe({
      next: (subjects) => {
        // Filtrer les matières où le teacher ID correspond à l'ID du professeur connecté
        this.teacherSubjects = subjects.filter(subject => 
          subject.teacher && 
          (typeof subject.teacher === 'object' ? 
            subject.teacher.id === currentUser.id : 
            subject.teacher === currentUser.id)
        );
        
        this.loadAssignments();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des matières', error);
        this.notificationService.error('Impossible de charger vos matières');
        this.loading = false;
      }
    });
  }

  loadAssignments(): void {
    const page = this.currentPage + 1; // API pagination starts from 1
    
    this.assignmentsService.getAssignments(page, this.pageSize)
      .subscribe({
        next: (data) => {
          let allAssignments = data.docs;
          this.totalItems = data.totalDocs;
          
          // Filtrer pour ne montrer que les assignments des matières enseignées
          if (this.teacherSubjects.length > 0) {
            const subjectIds = this.teacherSubjects.map(s => s.id);
            
            allAssignments = allAssignments.filter(a => {
              if (typeof a.matiere === 'object' && a.matiere) {
                return subjectIds.includes(a.matiere.id);
              } else {
                return subjectIds.includes(a.matiere as string);
              }
            });
          }
          
          // Filtrer par matière si un filtre est appliqué
          if (this.filteredSubjectId) {
            allAssignments = allAssignments.filter(a => {
              if (typeof a.matiere === 'object' && a.matiere) {
                return a.matiere.id === this.filteredSubjectId;
              } else {
                return a.matiere === this.filteredSubjectId;
              }
            });
          }
          
          this.assignments = allAssignments;
          this.dataSource = this.assignments;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des assignments', error);
          this.notificationService.error('Impossible de charger les assignments');
          this.loading = false;
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadAssignments();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  filterBySubject(subjectId: string): void {
    this.filteredSubjectId = subjectId;
    this.loadAssignments();
  }

  resetFilter(): void {
    this.filteredSubjectId = '';
    this.loadAssignments();
  }

  deleteAssignment(assignmentId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: 'Êtes-vous sûr de vouloir supprimer cet assignment ?',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.assignmentsService.deleteAssignment(assignmentId)
          .subscribe({
            next: () => {
              this.notificationService.success('Assignment supprimé avec succès');
              this.loadAssignments();
            },
            error: (error) => {
              console.error('Erreur lors de la suppression', error);
              this.notificationService.error('Impossible de supprimer l\'assignment');
            }
          });
      }
    });
  }

  getAssignmentStatusClass(assignment: Assignment): string {
    if (assignment.rendu) {
      return 'status-submitted';
    } else {
      const today = new Date();
      const deadline = new Date(assignment.dateDeRendu);
      
      if (deadline < today) {
        return 'status-late';
      } else {
        return 'status-pending';
      }
    }
  }

  getAssignmentStatusText(assignment: Assignment): string {
    if (assignment.rendu) {
      return 'Rendu';
    } else {
      const today = new Date();
      const deadline = new Date(assignment.dateDeRendu);
      
      if (deadline < today) {
        return 'En retard';
      } else {
        return 'Non rendu';
      }
    }
  }

  getSubjectName(assignment: Assignment): string {
    if (typeof assignment.matiere === 'object' && assignment.matiere) {
      return assignment.matiere.name;
    } else {
      const subject = this.teacherSubjects.find(s => s.id === assignment.matiere);
      return subject ? subject.name : 'Non spécifiée';
    }
  }
}