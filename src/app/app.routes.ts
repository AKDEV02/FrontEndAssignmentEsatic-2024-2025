import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ProfileComponent } from './features/auth/profile/profile.component';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard]
      },
      { 
        path: 'teacher', 
        loadChildren: () => import('./features/teacher/teacher.routes').then(m => m.TEACHER_ROUTES)
      },
      { 
        path: 'student', 
        loadChildren: () => import('./features/student/student.routes').then(m => m.STUDENT_ROUTES)
      },
      { 
        path: 'dashboard', 
        loadChildren: () => import('./features/dashboard/dashboard/dashboard.route').then(m => m.DASHBOARD_ROUTES)
      },
      { 
        path: 'assignments', 
        loadChildren: () => import('./features/assignments/assignments/assignments.route').then(m => m.ASSIGNMENTS_ROUTES)
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/auth/auth/auth.route').then(m => m.AUTH_ROUTES),
        canActivate: [AuthGuard]
      },
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.route').then(m => m.ADMIN_ROUTES),
        canActivate: [AuthGuard, AdminGuard]
      },
      // Nouvelles routes
      {
        path: 'teacher',
        loadChildren: () => import('./features/teacher/teacher.routes').then(m => m.TEACHER_ROUTES),
        canActivate: [AuthGuard]
      },
      {
        path: 'student',
        loadChildren: () => import('./features/student/student.routes').then(m => m.STUDENT_ROUTES),
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth/auth.route').then(m => m.AUTH_ROUTES)
  },
  { 
    path: '**', 
    redirectTo: 'dashboard' 
  }
];