import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';

// Services & Models
import { AuthService } from '../../../core/services/auth.service';
import { AssignmentsService } from '../../../core/services/assignments.service';
import { SubjectService } from '../../../core/services/subject.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Assignment } from '../../../core/models/assignment';
import { Subject } from '../../../core/models/subject';
import { User } from '../../../core/models/user';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatBadgeModule
  ],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private assignmentsService = inject(AssignmentsService);
  private subjectService = inject(SubjectService);
  private notificationService = inject(NotificationService);

  currentUser: User | null = null;
  allSubjects: Subject[] = [];
  pendingAssignments: Assignment[] = [];
  submittedAssignments: Assignment[] = [];
  recentAssignments: Assignment[] = [];
  
  loading = true;
  dashboardStats = {
    totalAssignments: 0,
    pendingAssignments: 0,
    submittedAssignments: 0,
    lateAssignments: 0
  };

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadStudentData();
  }

  loadStudentData(): void {
    // Charger les matières
    this.subjectService.getSubjects().subscribe({
      next: (subjects) => {
        this.allSubjects = subjects;
        this.loadStudentAssignments();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des matières', error);
        this.notificationService.error('Impossible de charger les matières');
        this.loading = false;
      }
    });
  }

  loadStudentAssignments(): void {
    if (!this.currentUser) {
      this.loading = false;
      return;
    }
    
    this.assignmentsService.getAssignments(1, 100).subscribe({
      next: (response) => {
        const allAssignments = response.docs;
        
        const studentAssignments = allAssignments.filter(a => {
          if (typeof a.auteur === 'object' && a.auteur) {
            return a.auteur.id === this.currentUser?.id;
          } else {
            return String(a.auteur).includes(this.currentUser?.username || '');
          }
        });
        
        studentAssignments.sort((a, b) => 
          new Date(b.dateDeRendu).getTime() - new Date(a.dateDeRendu).getTime()
        );
        
        this.recentAssignments = studentAssignments.slice(0, 5);
        
        this.pendingAssignments = studentAssignments.filter(a => !a.rendu);
        this.submittedAssignments = studentAssignments.filter(a => a.rendu);
        
        const today = new Date();
        const lateAssignments = this.pendingAssignments.filter(a => 
          new Date(a.dateDeRendu) < today
        );
        
        this.dashboardStats = {
          totalAssignments: studentAssignments.length,
          pendingAssignments: this.pendingAssignments.length,
          submittedAssignments: this.submittedAssignments.length,
          lateAssignments: lateAssignments.length
        };
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des assignments', error);
        this.notificationService.error('Impossible de charger les assignments');
        this.loading = false;
      }
    });
  }

  getSubjectName(subject: Subject | string): string {
    if (typeof subject === 'object' && subject) {
      return subject.name;
    } else {
      const foundSubject = this.allSubjects.find(s => s.id === subject);
      return foundSubject ? foundSubject.name : 'Inconnue';
    }
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
        return 'À rendre';
      }
    }
  }

  getDaysRemaining(dueDate: Date | string): string {
    const today = new Date();
    const deadline = new Date(dueDate);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Retard de ${Math.abs(diffDays)} jour(s)`;
    } else if (diffDays === 0) {
      return "À rendre aujourd'hui";
    } else if (diffDays === 1) {
      return "À rendre demain";
    } else {
      return `${diffDays} jours restants`;
    }
  }
  
  getDeadlineClass(assignment: Assignment): string {
    if (assignment.rendu) {
      return 'success';
    } else {
      const today = new Date();
      const deadline = new Date(assignment.dateDeRendu);
      
      if (deadline < today) {
        return 'alert';
      } else {
        return '';
      }
    }
  }
  
  isLate(assignment: Assignment): boolean {
    return new Date(assignment.dateDeRendu) < new Date();
  }
}