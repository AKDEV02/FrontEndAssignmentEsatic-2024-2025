import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { TeacherGuard } from '../../core/guards/teacher.guard';
import { TeacherDashboardComponent } from './teacher-dashboard/teacher-dashboard.component';
import { TeacherAssignmentsComponent } from './teacher-assignments/teacher-assignments.component';
import { StudentListComponent } from './student-list/student-list.component';
import { GradeAssignmentComponent } from './grade-assignment/grade-assignment.component';

export const TEACHER_ROUTES: Routes = [
  { path: '', component: TeacherDashboardComponent, canActivate: [AuthGuard, TeacherGuard] },
  { path: 'assignments', component: TeacherAssignmentsComponent, canActivate: [AuthGuard, TeacherGuard] },
  { path: 'students', component: StudentListComponent, canActivate: [AuthGuard, TeacherGuard] },
  { path: 'grade/:id', component: GradeAssignmentComponent, canActivate: [AuthGuard, TeacherGuard] }
];