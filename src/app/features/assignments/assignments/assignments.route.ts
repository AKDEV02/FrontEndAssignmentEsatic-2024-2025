import { Routes } from '@angular/router';

import { AssignmentListComponent } from '../assignment-list/assignment-list.component';
import { AssignmentDetailComponent } from '../assignment-detail/assignment-detail.component';
import { AssignmentFormComponent } from '../assignment-form/assignment-form.component';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { AdminGuard } from '../../../core/guards/admin.guard';


export const ASSIGNMENTS_ROUTES: Routes = [
  { path: '', component: AssignmentListComponent, canActivate: [AuthGuard] },
  { path: 'add', component: AssignmentFormComponent, canActivate: [AuthGuard] },
  { path: ':id', component: AssignmentDetailComponent, canActivate: [AuthGuard] },
  { path: ':id/edit', component: AssignmentFormComponent, canActivate: [AuthGuard] }
];