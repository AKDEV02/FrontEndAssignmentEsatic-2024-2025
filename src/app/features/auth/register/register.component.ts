import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

// Services
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ClassService } from '../../../core/services/class.service';
import { SubjectService } from '../../../core/services/subject.service';
import { Class } from '../../../core/models/class';
import { Subject } from '../../../core/models/subject';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
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
    MatSelectModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  registerForm!: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  

  classService = inject(ClassService);
  subjectService = inject(SubjectService);
  classes: Class[] = [];
  subjects: Subject[] = [];
  selectedRole: string = 'STUDENT';

  ngOnInit(): void {
    this.initForm();
    
    // Charger les classes et matières
    this.loadClasses();
    this.loadSubjects();
    
    // Redirect to dashboard if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  initForm(): void {
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['STUDENT', Validators.required],
      classId: [''],
      teachingSubjects: [[]]
    }, {
      validators: this.passwordMatchValidator
    });

    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      this.selectedRole = role;
      if (role === 'STUDENT') {
        this.registerForm.get('classId')?.setValidators([Validators.required]);
        this.registerForm.get('teachingSubjects')?.clearValidators();
      } else if (role === 'TEACHER') {
        this.registerForm.get('teachingSubjects')?.setValidators([Validators.required]);
        this.registerForm.get('classId')?.clearValidators();
      }
      this.registerForm.get('classId')?.updateValueAndValidity();
      this.registerForm.get('teachingSubjects')?.updateValueAndValidity();
    });
  }

  loadClasses(): void {
    this.classService.getAllClasses().subscribe({
      next: (classes) => {
        this.classes = classes;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classes', error);
      }
    });
  }

  loadSubjects(): void {
    this.subjectService.getSubjects().subscribe({
      next: (subjects) => {
        this.subjects = subjects;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des matières', error);
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    const userData = {
      ...this.registerForm.value,
    };
    
    delete userData.confirmPassword;

    this.authService.register(userData).subscribe({
      next: () => {
        this.notificationService.success('Inscription réussie! Veuillez vous connecter.');
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.notificationService.error(error.error?.message || 'Échec de l\'inscription');
        this.loading = false;
      }
    });
  }
}