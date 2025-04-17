import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

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
  selector: 'app-assignment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
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
    MatDialogModule,
    ConfirmDialogComponent
  ],
  templateUrl: './assignment-list.component.html',
  styleUrls: ['./assignment-list.component.css']
})
export class AssignmentListComponent implements OnInit {
  private assignmentsService = inject(AssignmentsService);
  private subjectService = inject(SubjectService);
  public authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  assignments: Assignment[] = [];
  subjects: Subject[] = [];
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
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadAssignments();
    this.loadSubjects();
  }

  ngAfterViewInit() {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  loadAssignments(filterSubject: boolean = false): void {
    this.loading = true;
    
    const page = this.currentPage + 1; // API pagination starts from 1
    
    this.assignmentsService.getAssignments(page, this.pageSize)
      .subscribe({
        next: (data) => {
          this.assignments = data.docs;
          this.totalItems = data.totalDocs;
          
          
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

  loadSubjects(): void {
    this.subjectService.getSubjects()
      .subscribe({
        next: (data) => {
          this.subjects = data;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des matières', error);
          this.notificationService.error('Impossible de charger les matières');
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadAssignments(!!this.filteredSubjectId);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  filterBySubject(subjectId: string): void {
    this.filteredSubjectId = subjectId;
    this.loadAssignments(true);
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
              this.loadAssignments(!!this.filteredSubjectId);
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
    } else if (typeof assignment.matiere === 'string') {
      const subject = this.subjects.find(s => s.id === assignment.matiere);
      return subject ? subject.name : 'Non spécifiée';
    }
    return 'Non spécifiée';
  }
}