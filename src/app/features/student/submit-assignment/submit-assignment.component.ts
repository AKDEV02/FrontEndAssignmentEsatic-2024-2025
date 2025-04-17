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

// Services & Models
import { AuthService } from '../../../core/services/auth.service';
import { AssignmentsService } from '../../../core/services/assignments.service';
import { SubjectService } from '../../../core/services/subject.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Assignment } from '../../../core/models/assignment';
import { Subject } from '../../../core/models/subject';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-submit-assignment',
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
    FileUploadComponent
  ],
  templateUrl: './submit-assignment.component.html',
  styleUrls: ['./submit-assignment.component.css']
})
export class SubmitAssignmentComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assignmentsService = inject(AssignmentsService);
  private subjectService = inject(SubjectService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  submitForm!: FormGroup;
  assignment: Assignment | null = null;
  subject: Subject | null = null;
  loading = true;
  submitting = false;
  uploadedFiles: string[] = [];

  ngOnInit(): void {
    // Vérifier si l'utilisateur est un étudiant
    if (!this.authService.isStudent()) {
      this.notificationService.error('Accès réservé aux étudiants');
      this.router.navigate(['/dashboard']);
      return;
    }

    this.initForm();
    this.loadAssignment();
  }

  initForm(): void {
    this.submitForm = this.formBuilder.group({
      comment: ['', Validators.required]
    });
  }

  loadAssignment(): void {
    const assignmentId = this.route.snapshot.paramMap.get('id');
    if (!assignmentId) {
      this.notificationService.error('ID d\'assignment invalide');
      this.router.navigate(['/student/assignments']);
      return;
    }

    this.assignmentsService.getAssignment(assignmentId).subscribe({
      next: (assignment) => {
        this.assignment = assignment;
        
        // Vérifier si l'assignment est déjà rendu
        if (assignment.rendu) {
          this.notificationService.info('Cet assignment a déjà été rendu');
          // On peut quand même permettre une nouvelle soumission
        }
        
        // Charger les détails de la matière
        if (typeof assignment.matiere === 'string') {
          this.loadSubjectDetails(assignment.matiere);
        } else if (assignment.matiere) {
          this.subject = assignment.matiere as Subject;
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'assignment', error);
        this.notificationService.error('Impossible de charger les détails de l\'assignment');
        this.loading = false;
        this.router.navigate(['/student/assignments']);
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

  onFileUploaded(fileUrls: string[]): void {
    this.uploadedFiles = fileUrls;
  }

  onSubmit(): void {
    if (this.submitForm.invalid || !this.assignment) {
      return;
    }

    if (this.uploadedFiles.length === 0) {
      this.notificationService.error('Veuillez uploader au moins un fichier');
      return;
    }

    this.submitting = true;

    
    setTimeout(() => {
      this.notificationService.success('Assignment soumis avec succès');
      this.submitting = false;
      this.router.navigate(['/student/assignments']);
    }, 1500);

  }

  onCancel(): void {
    this.router.navigate(['/student/assignments']);
  }

  isLate(): boolean {
    if (!this.assignment) return false;
    
    const today = new Date();
    const deadline = new Date(this.assignment.dateDeRendu);
    return deadline < today;
  }
}