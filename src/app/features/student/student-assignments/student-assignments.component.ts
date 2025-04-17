import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Services & Models
import { AuthService } from '../../../core/services/auth.service';
import { AssignmentsService } from '../../../core/services/assignments.service';
import { SubjectService } from '../../../core/services/subject.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Assignment } from '../../../core/models/assignment';
import { Subject } from '../../../core/models/subject';
import { User } from '../../../core/models/user';

@Component({
  selector: 'app-student-assignments',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './student-assignments.component.html',
  styleUrls: ['./student-assignments.component.css']
})
export class StudentAssignmentsComponent implements OnInit {
  private authService = inject(AuthService);
  private assignmentsService = inject(AssignmentsService);
  private subjectService = inject(SubjectService);
  private notificationService = inject(NotificationService);

  currentUser: User | null = null;
  allSubjects: Subject[] = [];
  pendingAssignments: Assignment[] = [];
  submittedAssignments: Assignment[] = [];
  lateAssignments: Assignment[] = [];
  loading = true;
  searchText = '';

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadData();
  }

  loadData(): void {
    this.subjectService.getSubjects().subscribe({
      next: (subjects) => {
        this.allSubjects = subjects;
        this.loadAssignments();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des matières', error);
        this.notificationService.error('Impossible de charger les matières');
        this.loading = false;
      }
    });
  }

  loadAssignments(): void {
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
        
        this.pendingAssignments = studentAssignments.filter(a => !a.rendu);
        this.submittedAssignments = studentAssignments.filter(a => a.rendu);
        
        const today = new Date();
        this.lateAssignments = this.pendingAssignments.filter(a => 
          new Date(a.dateDeRendu) < today
        );
        
        this.pendingAssignments.sort((a, b) => 
          new Date(a.dateDeRendu).getTime() - new Date(b.dateDeRendu).getTime()
        );
        
        this.submittedAssignments.sort((a, b) => 
          new Date(b.dateDeRendu).getTime() - new Date(a.dateDeRendu).getTime()
        );
        
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

  getStatusClass(assignment: Assignment): string {
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

  filterAssignments(assignments: Assignment[]): Assignment[] {
    if (!this.searchText.trim()) {
      return assignments;
    }
    
    const search = this.searchText.toLowerCase().trim();
    
    return assignments.filter(assignment => 
      assignment.nom.toLowerCase().includes(search) ||
      this.getSubjectName(assignment.matiere).toLowerCase().includes(search)
    );
  }
}