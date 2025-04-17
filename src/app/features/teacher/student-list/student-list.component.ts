import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

// Services & Models
import { AuthService } from '../../../core/services/auth.service';
import { SubjectService } from '../../../core/services/subject.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Subject } from '../../../core/models/subject';
import { User } from '../../../core/models/user';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatListModule,
    MatTableModule,
    MatChipsModule
  ],
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {
  private authService = inject(AuthService);
  private subjectService = inject(SubjectService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);

  currentUser: User | null = null;
  teacherSubjects: Subject[] = [];
  selectedSubject: Subject | null = null;
  loading = true;
  students: User[] = [];
  searchText = '';

  displayedColumns: string[] = ['name', 'email', 'status'];

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Vérifier s'il y a un filtrage par matière dans l'URL
    this.route.queryParams.subscribe(params => {
      const subjectId = params['subject'];
      if (subjectId) {
        this.loadTeacherSubjects(subjectId);
      } else {
        this.loadTeacherSubjects();
      }
    });
  }

  loadTeacherSubjects(selectedSubjectId?: string): void {
    if (!this.currentUser) return;
    
    this.subjectService.getSubjects().subscribe({
      next: (subjects) => {
        this.teacherSubjects = subjects.filter(subject => 
          subject.teacher && 
          (typeof subject.teacher === 'object' ? 
            subject.teacher?.id === this.currentUser?.id : 
            subject.teacher === this.currentUser?.id)
        );
        
        if (selectedSubjectId && this.teacherSubjects.length > 0) {
          this.selectedSubject = this.teacherSubjects.find(s => s.id === selectedSubjectId) || null;
        }
        
        this.loading = false;
        
        this.loadStudentsForSubject();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des matières', error);
        this.notificationService.error('Impossible de charger vos matières');
        this.loading = false;
      }
    });
  }

  selectSubject(subject: Subject): void {
    this.selectedSubject = subject;
    this.loadStudentsForSubject();
  }

  loadStudentsForSubject(): void {
    
    this.students = [
      {
        id: '1',
        username: 'student1',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        role: 'student'
      },
      {
        id: '2',
        username: 'student2',
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie.martin@example.com',
        role: 'student'
      },
      {
        id: '3',
        username: 'student3',
        firstName: 'Pierre',
        lastName: 'Bernard',
        email: 'pierre.bernard@example.com',
        role: 'student'
      }
    ];
  }

  filterStudents(): User[] {
    if (!this.searchText.trim()) {
      return this.students;
    }
    
    const search = this.searchText.toLowerCase();
    
    return this.students.filter(student => 
      student.firstName.toLowerCase().includes(search) ||
      student.lastName.toLowerCase().includes(search) ||
      student.email.toLowerCase().includes(search) ||
      student.username.toLowerCase().includes(search)
    );
  }

  getInitials(student: User): string {
    return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
  }
}