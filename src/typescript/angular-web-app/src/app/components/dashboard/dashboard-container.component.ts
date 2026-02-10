import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { DashboardViewComponent } from './dashboard-view.component';

@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [DashboardViewComponent],
  template: `
    <app-dashboard-view
      [currentUser]="currentUser"
      (logoutClick)="logout()"
    ></app-dashboard-view>
  `,
})
export class DashboardContainerComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
