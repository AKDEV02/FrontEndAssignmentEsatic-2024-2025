import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog/confirm-dialog.component';

// Angular Material
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    ConfirmDialogComponent

  ],
  exports: [
    ConfirmDialogComponent
  ]
})
export class SharedModule { }