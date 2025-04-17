import { Component, ViewChild, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

// Services
import { AuthService } from '../../services/auth.service';

// Components
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    SidebarComponent,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatSidenav;
  
  private breakpointObserver = inject(BreakpointObserver);
  public authService = inject(AuthService);

  isHandset$!: Observable<boolean>;
  isHandset: boolean = false;

  ngOnInit(): void {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map(result => result.matches),
      shareReplay()
    );
    
    this.isHandset$.subscribe(value => {
      this.isHandset = value;
    });
  }

  toggleSidenav() {
    this.drawer.toggle();
  }

  closeSidenav() {
    if (this.drawer && this.isHandset) {
      this.drawer.close();
    }
  }
}