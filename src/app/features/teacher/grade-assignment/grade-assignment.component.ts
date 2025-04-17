import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSliderModule } from '@angular/material/slider';

// Services & Models
import { AuthService } from '../../../core/services/auth.service';
import { AssignmentsService } from '../../../core/services/assignments.service';
import { SubjectService } from '../../../core/services/subject.service';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Assignment } from '../../../core/models/assignment';
import { Subject } from '../../../core/models/subject';

@Component({
  selector: 'app-grade-assignment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSliderModule
  ],
  templateUrl: './grade-assignment.component.html',
  styleUrls: ['./grade-assignment.component.css']
})
export class GradeAssignmentComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assignmentsService = inject(AssignmentsService);
  private subjectService = inject(SubjectService);
  private fileUploadService = inject(FileUploadService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  gradeForm!: FormGroup;
  assignment: Assignment | null = null;
  subject: Subject | null = null;
  uploadedFiles: any[] = [];
  loading = true;
  submitting = false;

  ngOnInit(): void {
    // Vérifier si l'utilisateur est un professeur
    if (!this.authService.isTeacher()) {
      this.notificationService.error('Accès réservé aux professeurs');
      this.router.navigate(['/dashboard']);
      return;
    }

    this.initForm();
    this.loadAssignment();
  }

  initForm(): void {
    this.gradeForm = this.formBuilder.group({
      note: [null, [Validators.required, Validators.min(0), Validators.max(20)]],
      remarques: ['', Validators.required]
    });
  }

  loadAssignment(): void {
    const assignmentId = this.route.snapshot.paramMap.get('id');
    if (!assignmentId) {
      this.notificationService.error('ID d\'assignment invalide');
      this.router.navigate(['/teacher/assignments']);
      return;
    }

    this.assignmentsService.getAssignment(assignmentId).subscribe({
      next: (assignment) => {
        this.assignment = assignment;
        
        // Vérifier si l'assignment est déjà noté et préremplir le formulaire
        if (assignment.note) {
          this.gradeForm.patchValue({
            note: assignment.note,
            remarques: assignment.remarques || ''
          });
        }
        
        // Charger les détails de la matière
        if (typeof assignment.matiere === 'string') {
          this.loadSubjectDetails(assignment.matiere);
        } else if (assignment.matiere) {
          this.subject = assignment.matiere as Subject;
        }
        
        // Idéalement, nous chargerions les fichiers soumis par l'étudiant ici
        // Mais comme c'est une fonctionnalité à implémenter, nous simulons
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'assignment', error);
        this.notificationService.error('Impossible de charger les détails de l\'assignment');
        this.loading = false;
        this.router.navigate(['/teacher/assignments']);
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
      }
    });
  }

  onSubmit(): void {
    if (this.gradeForm.invalid || !this.assignment) {
      return;
    }

    this.submitting = true;

    const updatedAssignment: Assignment = {
      ...this.assignment,
      note: this.gradeForm.value.note,
      remarques: this.gradeForm.value.remarques,
      rendu: true // Marquer comme rendu lorsqu'il est noté
    };

    this.assignmentsService.updateAssignment(updatedAssignment).subscribe({
      next: () => {
        this.notificationService.success('Assignment noté avec succès');
        this.submitting = false;
        this.router.navigate(['/teacher/assignments']);
      },
      error: (error) => {
        console.error('Erreur lors de la notation de l\'assignment', error);
        this.notificationService.error('Impossible de noter l\'assignment');
        this.submitting = false;
      }
    });
  }

  getAuthorName(): string {
    if (!this.assignment) return '';
    
    if (typeof this.assignment.auteur === 'object' && this.assignment.auteur) {
      return `${this.assignment.auteur.firstName} ${this.assignment.auteur.lastName}`;
    } else {
      return String(this.assignment.auteur || 'Non spécifié');
    }
  }

  formatSliderLabel(value: number): string {
    return `${value}/20`;
  }

  onCancel(): void {
    this.router.navigate(['/teacher/assignments']);
  }
}