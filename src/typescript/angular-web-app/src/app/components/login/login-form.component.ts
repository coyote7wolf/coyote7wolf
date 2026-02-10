import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    NavbarComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginFormComponent {
  @Input() loginForm!: FormGroup;
  @Input() isLoading = false;
  @Input() generalError = '';
  @Input() rememberMe = false;

  @Output() loginSubmit = new EventEmitter<void>();
  @Output() oauthLogin = new EventEmitter<'google' | 'github' | 'microsoft'>();
  @Output() emailChange = new EventEmitter<void>();
  @Output() rememberMeChange = new EventEmitter<boolean>();

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onEmailChange(): void {
    if (this.email?.hasError('email') || this.email?.hasError('required')) {
      // Keep error
    } else {
      this.email?.setErrors(null);
    }
    this.emailChange.emit();
  }

  handleLogin(): void {
    if (this.loginForm.invalid) {
      return;
    }
    this.loginSubmit.emit();
  }

  handleOAuthLogin(provider: 'google' | 'github' | 'microsoft'): void {
    this.oauthLogin.emit(provider);
  }

  onRememberMeChange(checked: boolean): void {
    this.rememberMe = checked;
    this.rememberMeChange.emit(checked);
  }
}
