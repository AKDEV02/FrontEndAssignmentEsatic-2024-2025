import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Color } from '@swimlane/ngx-charts';
import { ScaleType } from '@swimlane/ngx-charts';
import { LegendPosition } from '@swimlane/ngx-charts';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

// NGX Charts
import { NgxChartsModule } from '@swimlane/ngx-charts';

// Services et modèles
import { AssignmentsService } from '../../../core/services/assignments.service';
import { SubjectService } from '../../../core/services/subject.service';
import { Assignment } from '../../../core/models/assignment';
import { Subject } from '../../../core/models/subject';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    NgxChartsModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  
})
export class AdminDashboardComponent implements OnInit {
  private assignmentsService = inject(AssignmentsService);
  private subjectService = inject(SubjectService);

  assignments: Assignment[] = [];
  subjects: Subject[] = [];
  totalAssignments = 0;
  totalSubjects = 0;
  totalStudents = 0;
  totalTeachers = 0; 
  loading = true;
  
  subjectDistribution: any[] = [];
  
  trendData: any[] = [];

  colorScheme: Color = {
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#4CAF50', '#F44336']
  };
  
  pieColorScheme: Color = {
    name: 'pieScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#3F51B5', '#E91E63', '#2196F3', '#FF9800', '#4CAF50', '#9C27B0']
  };

  legendPosition = LegendPosition.Below;

  
  displayedColumns: string[] = ['nom', 'matiere', 'dateDeRendu', 'auteur', 'rendu', 'note', 'actions'];
  
  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.assignmentsService.getAssignments(1, 10).subscribe({
      next: (data) => {
        this.assignments = data.docs;
        this.totalAssignments = data.totalDocs;
        this.prepareTrendData();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des assignments', error);
        this.loading = false;
      }
    });
    
    this.subjectService.getSubjects().subscribe({
      next: (data) => {
        this.subjects = data;
        this.totalSubjects = data.length;
        this.prepareSubjectDistribution();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des matières', error);
      }
    });
    
    this.totalStudents = 120;
    this.totalTeachers = 15;
  }

  prepareSubjectDistribution(): void {
    // Exemple de données pour la répartition par matière
    this.subjectDistribution = this.subjects.map(subject => {
      const count = this.assignments.filter(a => 
        (typeof a.matiere === 'object' && a.matiere?.id === subject.id) || 
        (typeof a.matiere === 'string' && a.matiere === subject.id)
      ).length;
      
      return {
        name: subject.name,
        value: count
      };
    });
  }

  prepareTrendData(): void {
    const months = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
      'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
    ];
    
    this.trendData = [
      {
        name: 'Assignments Rendus',
        series: months.map((month) => ({
          name: month,
          value: Math.floor(Math.random() * 30) + 10
        }))
      },
      {
        name: 'Assignments Non Rendus',
        series: months.map((month) => ({
          name: month,
          value: Math.floor(Math.random() * 20) + 5
        }))
      }
    ];
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
        return 'Non rendu';
      }
    }
  }
  
  deleteAssignment(id: string): void {
    console.log('Suppression de l\'assignment: ', id);
  }
}