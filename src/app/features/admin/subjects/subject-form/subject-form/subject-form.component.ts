import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

// Models and Services
import { Teacher } from '../../../../../core/models/teacher';
import { Subject } from '../../../../../core/models/subject';
import { SubjectService } from '../../../../../core/services/subject.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { TeacherService } from '../../../../../core/services/teacher.service';

// Components
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-subject-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    ConfirmDialogComponent
  ],
  templateUrl: './subject-form.component.html',
  styleUrl: './subject-form.component.css'
})
export class SubjectFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private subjectService = inject(SubjectService);
  private teacherService = inject(TeacherService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  subjectForm!: FormGroup;
  subject: Subject | null = null;
  teachers: Teacher[] = [];
  isEditMode = false;
  loading = false;
  saveLoading = false;

  ngOnInit(): void {
    this.initForm();
    this.loadTeachers();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadSubject(id);
    }
  }

  initForm(): void {
    this.subjectForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      teacher: [null],
      imageUrl: [''],
      color: ['#3f51b5']
    });
  }

  loadTeachers(): void {
    this.teacherService.getAllTeachers().subscribe({
      next: (teachers) => {
        this.teachers = teachers;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des professeurs', error);
        this.notificationService.error('Impossible de charger la liste des professeurs');
      }
    });
  }

  loadSubject(id: string): void {
    this.loading = true;
    this.subjectService.getSubject(id).subscribe({
      next: (subject) => {
        this.subject = subject;
        this.patchFormValues();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la matière', error);
        this.notificationService.error('Impossible de charger les détails de la matière');
        this.loading = false;
        this.router.navigate(['/admin/subjects']);
      }
    });
  }

  patchFormValues(): void {
    if (!this.subject) return;
    
    const teacherId = typeof this.subject.teacher === 'object' && this.subject.teacher 
      ? this.subject.teacher.id 
      : this.subject.teacher;
    
    this.subjectForm.patchValue({
      name: this.subject.name,
      description: this.subject.description,
      teacher: teacherId,
      imageUrl: this.subject.imageUrl,
      color: this.subject.color
    });
  }

  onSubmit(): void {
    if (this.subjectForm.invalid) {
      return;
    }
    
    this.saveLoading = true;
    
    // ChatGPT
    const subjectData: Subject = {
      ...this.subject, // Conserver les propriétés existantes en cas d'édition
      ...this.subjectForm.value
    };
    
    if (this.isEditMode && this.subject) {
      // Mise à jour d'une matière existante
      this.updateSubject(subjectData);
    } else {
      // Création d'une nouvelle matière
      this.createSubject(subjectData);
    }
  }

  createSubject(subject: Subject): void {
    this.subjectService.createSubject(subject).subscribe({
      next: () => {
        this.notificationService.success('Matière créée avec succès');
        this.saveLoading = false;
        this.router.navigate(['/admin/subjects']);
      },
      error: (error) => {
        console.error('Erreur lors de la création de la matière', error);
        this.notificationService.error('Impossible de créer la matière');
        this.saveLoading = false;
      }
    });
  }

  updateSubject(subject: Subject): void {
    this.subjectService.updateSubject(subject).subscribe({
      next: () => {
        this.notificationService.success('Matière mise à jour avec succès');
        this.saveLoading = false;
        this.router.navigate(['/admin/subjects']);
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour de la matière', error);
        this.notificationService.error('Impossible de mettre à jour la matière');
        this.saveLoading = false;
      }
    });
  }

  onCancel(): void {
    // Confirmer l'annulation si le formulaire a été modifié
    if (this.subjectForm.dirty) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Annuler les modifications',
          message: 'Êtes-vous sûr de vouloir annuler ? Toutes les modifications seront perdues.',
          confirmText: 'Oui, annuler',
          cancelText: 'Non, continuer'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.navigateBack();
        }
      });
    } else {
      this.navigateBack();
    }
  }

  navigateBack(): void {
    this.location.back();
  }
}
