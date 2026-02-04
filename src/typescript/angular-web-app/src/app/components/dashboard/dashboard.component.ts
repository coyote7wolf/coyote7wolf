import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, User } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
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

  getProviderLabel(provider?: string): string {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'github':
        return 'GitHub';
      case 'microsoft':
        return 'Microsoft';
      default:
        return 'Email/Password';
    }
  }
}
