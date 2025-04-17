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
import { MatListModule } from '@angular/material/list';

// NGX Charts
import { NgxChartsModule } from '@swimlane/ngx-charts';

// Services et modèles
import { AssignmentsService } from '../../../core/services/assignments.service';
import { AuthService } from '../../../core/services/auth.service';
import { Assignment } from '../../../core/models/assignment';

@Component({
  selector: 'app-home-dashboard',
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
    NgxChartsModule,
    MatListModule
  ],
  templateUrl: './home-dashboard.component.html',
  styleUrls: ['./home-dashboard.component.css']
})
export class HomeDashboardComponent implements OnInit {
  private assignmentsService = inject(AssignmentsService);
  public authService = inject(AuthService);

  recentAssignments: Assignment[] = [];
  pendingAssignments: Assignment[] = [];
  totalAssignments = 0;
  totalRendu = 0;
  totalNonRendu = 0;
  loading = true;
  
  // Pour le graphique
  chartData: any[] = [];

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
  
  
  displayedColumns: string[] = ['nom', 'matiere', 'dateDeRendu', 'auteur', 'rendu', 'actions'];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Charger les assignments récents
    this.assignmentsService.getAssignments(1, 5).subscribe({
      next: (data) => {
        this.recentAssignments = data.docs;
        this.totalAssignments = data.totalDocs;
        
        // Calculer le nombre d'assignments rendus/non rendus
        this.totalRendu = data.docs.filter(a => a.rendu).length;
        this.totalNonRendu = data.totalDocs - this.totalRendu;
        
        // Préparer les données pour le graphique
        this.prepareChartData();
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des assignments', error);
        this.loading = false;
      }
    });
    
    // Charger les assignments en attente
    this.assignmentsService.getPendingAssignments().subscribe({
      next: (data) => {
        this.pendingAssignments = data.docs;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des assignments en attente', error);
      }
    });
  }

  prepareChartData(): void {
    // Exemple de données pour le graphique
    this.chartData = [
      { name: 'Rendus', value: this.totalRendu },
      { name: 'Non rendus', value: this.totalNonRendu }
    ];
  }

  isUrgent(dateDeRendu: Date): boolean {
    const today = new Date();
    const deadline = new Date(dateDeRendu);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  }
}