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
  selector: 'app-teacher-dashboard',
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
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.css']
})
export class TeacherDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private assignmentsService = inject(AssignmentsService);
  private subjectService = inject(SubjectService);
  private notificationService = inject(NotificationService);

  teacherSubjects: Subject[] = [];
  pendingAssignments: Assignment[] = [];
  submittedAssignments: Assignment[] = [];
  lateAssignments: Assignment[] = [];
  
  loading = true;
  dashboardStats = {
    totalAssignments: 0,
    pendingAssignments: 0,
    submittedAssignments: 0,
    lateAssignments: 0
  };

  ngOnInit(): void {
    this.loadTeacherData();
  }

  loadTeacherData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;
    
    // Charger les matières du professeur
    this.subjectService.getSubjects().subscribe({
      next: (subjects) => {
        // Filtrer les matières où le teacher ID correspond à l'ID du professeur connecté
        this.teacherSubjects = subjects.filter(subject => 
          subject.teacher && 
          (typeof subject.teacher === 'object' ? 
            subject.teacher.id === currentUser.id : 
            subject.teacher === currentUser.id)
        );
        
        // Charger les assignments des matières enseignées
        this.loadAssignmentsForTeacher();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des matières', error);
        this.notificationService.error('Impossible de charger vos matières');
        this.loading = false;
      }
    });
  }

  loadAssignmentsForTeacher(): void {
    if (this.teacherSubjects.length === 0) {
      this.loading = false;
      return;
    }
    
    // Récupérer les assignments pour chaque matière enseignée
    // Pour le moment, nous allons simuler avec getAllAssignments
    this.assignmentsService.getAssignments(1, 100).subscribe({
      next: (response) => {
        const allAssignments = response.docs;
        const subjectIds = this.teacherSubjects.map(s => s.id);
        
        // Filtrer les assignments par matière
        const teacherAssignments = allAssignments.filter(a => {
          // Vérifier si la matière est dans la liste des matières du professeur
          if (typeof a.matiere === 'object' && a.matiere) {
            return subjectIds.includes(a.matiere.id);
          } else {
            return subjectIds.includes(a.matiere as string);
          }
        });
        
        // Trier les assignments par statut
        this.pendingAssignments = teacherAssignments.filter(a => !a.rendu);
        this.submittedAssignments = teacherAssignments.filter(a => a.rendu);
        
        // Trouver les assignments en retard
        const today = new Date();
        this.lateAssignments = this.pendingAssignments.filter(a => 
          new Date(a.dateDeRendu) < today
        );
        
        // Mettre à jour les stats du dashboard
        this.dashboardStats = {
          totalAssignments: teacherAssignments.length,
          pendingAssignments: this.pendingAssignments.length,
          submittedAssignments: this.submittedAssignments.length,
          lateAssignments: this.lateAssignments.length
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
      const foundSubject = this.teacherSubjects.find(s => s.id === subject);
      return foundSubject ? foundSubject.name : 'Inconnue';
    }
  }

  getAuthorName(author: string | User | null): string {
    if (!author) return 'Non spécifié';
    
    if (typeof author === 'object' && author.username) {
      return author.username;
    }
    
    return String(author);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  navigateToAssignment(assignmentId: string): void {
    // Naviguer vers la page de détail de l'assignment
  }
}