import { Routes } from '@angular/router';

import { HomeDashboardComponent } from '../home-dashboard/home-dashboard.component';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { AdminGuard } from '../../../core/guards/admin.guard';

export const DASHBOARD_ROUTES: Routes = [
  { path: '', component: HomeDashboardComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard, AdminGuard] }
];