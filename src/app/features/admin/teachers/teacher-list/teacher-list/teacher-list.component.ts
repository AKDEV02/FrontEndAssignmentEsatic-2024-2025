import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

// Models and Services
import { Teacher } from '../../../../../core/models/teacher';
import { Subject } from '../../../../../core/models/subject';
import { TeacherService } from '../../../../../core/services/teacher.service';
import { SubjectService } from '../../../../../core/services/subject.service';
import { NotificationService } from '../../../../../core/services/notification.service';

// Components
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-teacher-list',
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
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatDialogModule,
    ConfirmDialogComponent
  ],
 templateUrl: './teacher-list.component.html',
  styleUrl: './teacher-list.component.css'
})
export class TeacherListComponent implements OnInit {
  private teacherService = inject(TeacherService);
  private subjectService = inject(SubjectService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  teachers: Teacher[] = [];
  subjects: Subject[] = [];
  dataSource: any = [];
  displayedColumns: string[] = ['name', 'email', 'subjects', 'actions'];
  loading = true;

  ngOnInit(): void {
    this.loadTeachers();
    this.loadSubjects();
  }

  loadTeachers(): void {
    this.loading = true;
    this.teacherService.getAllTeachers().subscribe({
      next: (data) => {
        this.teachers = data;
        this.dataSource = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des professeurs', error);
        this.notificationService.error('Impossible de charger les professeurs');
        this.loading = false;
      }
    });
  }

  loadSubjects(): void {
    this.subjectService.getSubjects().subscribe({
      next: (data) => {
        this.subjects = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des matières', error);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  deleteTeacher(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: 'Êtes-vous sûr de vouloir supprimer ce professeur ? Cette action est irréversible.',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.teacherService.deleteTeacher(id).subscribe({
          next: () => {
            this.notificationService.success('Professeur supprimé avec succès');
            this.loadTeachers();
          },
          error: (error) => {
            console.error('Erreur lors de la suppression', error);
            this.notificationService.error('Impossible de supprimer le professeur');
          }
        });
      }
    });
  }

  getSubjectsForTeacher(teacher: Teacher): Subject[] {
    if (!teacher.subjects || !teacher.subjects.length) {
      return [];
    }
    
    return this.subjects.filter(subject => 
      teacher.subjects?.includes(subject.id)
    );
  }

  getInitials(teacher: Teacher): string {
    return `${teacher.firstName.charAt(0)}${teacher.lastName.charAt(0)}`.toUpperCase();
  }
}