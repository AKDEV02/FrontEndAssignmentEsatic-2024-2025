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
import { TeacherService } from '../../../../../core/services/teacher.service';
import { SubjectService } from '../../../../../core/services/subject.service';
import { NotificationService } from '../../../../../core/services/notification.service';

// Components
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-teacher-form',
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
  templateUrl: './teacher-form.component.html',
  styleUrl: './teacher-form.component.css'
})
export class TeacherFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private teacherService = inject(TeacherService);
  private subjectService = inject(SubjectService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  teacherForm!: FormGroup;
  teacher: Teacher | null = null;
  subjects: Subject[] = [];
  isEditMode = false;
  loading = false;
  saveLoading = false;

  ngOnInit(): void {
    this.initForm();
    this.loadSubjects();
    
    // Vérifier s'il s'agit d'une édition
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadTeacher(id);
    }
  }

  initForm(): void {
    this.teacherForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.email]],
      photoUrl: [''],
      subjects: [[]]
    });
  }

  loadSubjects(): void {
    this.subjectService.getSubjects().subscribe({
      next: (subjects) => {
        this.subjects = subjects;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des matières', error);
        this.notificationService.error('Impossible de charger la liste des matières');
      }
    });
  }

  loadTeacher(id: string): void {
    this.loading = true;
    this.teacherService.getTeacher(id).subscribe({
      next: (teacher) => {
        this.teacher = teacher;
        this.patchFormValues();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du professeur', error);
        this.notificationService.error('Impossible de charger les détails du professeur');
        this.loading = false;
        this.router.navigate(['/admin/teachers']);
      }
    });
  }

  patchFormValues(): void {
    if (!this.teacher) return;
    
    this.teacherForm.patchValue({
      firstName: this.teacher.firstName,
      lastName: this.teacher.lastName,
      email: this.teacher.email,
      photoUrl: this.teacher.photoUrl,
      subjects: this.teacher.subjects || []
    });
  }

  onSubmit(): void {
    if (this.teacherForm.invalid) {
      return;
    }
    
    this.saveLoading = true;
    
    // Construire l'objet teacher à partir des valeurs du formulaire
    const teacherData: Teacher = {
      ...this.teacher, // Conserver les propriétés existantes en cas d'édition
      ...this.teacherForm.value
    };
    
    if (this.isEditMode && this.teacher) {
      // Mise à jour d'un professeur existant
      this.updateTeacher(teacherData);
    } else {
      // Création d'un nouveau professeur
      this.createTeacher(teacherData);
    }
  }

  createTeacher(teacher: Teacher): void {
    this.teacherService.createTeacher(teacher).subscribe({
      next: () => {
        this.notificationService.success('Professeur créé avec succès');
        this.saveLoading = false;
        this.router.navigate(['/admin/teachers']);
      },
      error: (error) => {
        console.error('Erreur lors de la création du professeur', error);
        this.notificationService.error('Impossible de créer le professeur');
        this.saveLoading = false;
      }
    });
  }

  updateTeacher(teacher: Teacher): void {
    this.teacherService.updateTeacher(teacher).subscribe({
      next: () => {
        this.notificationService.success('Professeur mis à jour avec succès');
        this.saveLoading = false;
        this.router.navigate(['/admin/teachers']);
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du professeur', error);
        this.notificationService.error('Impossible de mettre à jour le professeur');
        this.saveLoading = false;
      }
    });
  }

  onCancel(): void {
    // Confirmer l'annulation si le formulaire a été modifié
    if (this.teacherForm.dirty) {
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