import { Routes } from '@angular/router';
import { SubjectListComponent } from './subjects/subject-list/subject-list/subject-list.component';
import { SubjectFormComponent } from './subjects/subject-form/subject-form/subject-form.component';
import { TeacherListComponent } from './teachers/teacher-list/teacher-list/teacher-list.component';
import { TeacherFormComponent } from './teachers/teacher-form/teacher-form/teacher-form.component';
import { UserListComponent } from './users/user-list/user-list/user-list.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { AdminGuard } from '../../core/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  { path: 'subjects', component: SubjectListComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'subjects/add', component: SubjectFormComponent, canActivate: [AuthGuard, AdminGuard] },
  { 
    path: 'subjects/:id/edit', 
    component: SubjectFormComponent, 
    canActivate: [AuthGuard, AdminGuard],
    data: {
      prerender: false
    }
  },
  { path: 'teachers', component: TeacherListComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'teachers/add', component: TeacherFormComponent, canActivate: [AuthGuard, AdminGuard] },
  { 
    path: 'teachers/:id/edit', 
    component: TeacherFormComponent, 
    canActivate: [AuthGuard, AdminGuard],
    data: {
      prerender: false
    }
  },
  { path: 'users', component: UserListComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: '', redirectTo: 'subjects', pathMatch: 'full' }
];