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

// Models and Services
import { Subject } from '../../../../../core/models/subject';
import { SubjectService } from '../../../../../core/services/subject.service';
import { NotificationService } from '../../../../../core/services/notification.service';

// Components
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-subject-list',
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
    MatDialogModule,
    ConfirmDialogComponent
  ],
  templateUrl: './subject-list.component.html',
  styleUrl: './subject-list.component.css'
})
export class SubjectListComponent implements OnInit {
  private subjectService = inject(SubjectService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  subjects: Subject[] = [];
  dataSource: any = [];
  displayedColumns: string[] = ['name', 'description', 'teacher', 'actions'];
  loading = true;

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.loading = true;
    this.subjectService.getSubjects().subscribe({
      next: (data) => {
        this.subjects = data;
        this.dataSource = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des matières', error);
        this.notificationService.error('Impossible de charger les matières');
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  deleteSubject(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: 'Êtes-vous sûr de vouloir supprimer cette matière ? Cette action est irréversible.',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.subjectService.deleteSubject(id).subscribe({
          next: () => {
            this.notificationService.success('Matière supprimée avec succès');
            this.loadSubjects();
          },
          error: (error) => {
            console.error('Erreur lors de la suppression', error);
            this.notificationService.error('Impossible de supprimer la matière');
          }
        });
      }
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
