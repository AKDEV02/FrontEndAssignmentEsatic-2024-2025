import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { StudentGuard } from '../../core/guards/student.guard'; // À créer
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';
import { StudentAssignmentsComponent } from './student-assignments/student-assignments.component';
import { SubmitAssignmentComponent } from './submit-assignment/submit-assignment.component';

export const STUDENT_ROUTES: Routes = [
  { path: '', component: StudentDashboardComponent, canActivate: [AuthGuard, StudentGuard] },
  { path: 'assignments', component: StudentAssignmentsComponent, canActivate: [AuthGuard, StudentGuard] },
  { path: 'submit/:id', component: SubmitAssignmentComponent, canActivate: [AuthGuard, StudentGuard] }
];