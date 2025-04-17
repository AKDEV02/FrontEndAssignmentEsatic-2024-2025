import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Angular Material
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule
  ],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}