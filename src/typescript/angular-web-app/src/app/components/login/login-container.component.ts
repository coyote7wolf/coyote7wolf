import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginFormComponent } from './login-form.component';

@Component({
  selector: 'app-login-container',
  standalone: true,
  imports: [LoginFormComponent],
  template: `
    <app-login-form
      [loginForm]="loginForm"
      [isLoading]="isLoading"
      [generalError]="generalError"
      [rememberMe]="rememberMe"
      (loginSubmit)="handleLogin()"
      (oauthLogin)="handleOAuthLogin($event)"
      (emailChange)="onEmailChange()"
      (rememberMeChange)="onRememberMeChange($event)"
    ></app-login-form>
  `,
})
export class LoginContainerComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  generalError = '';
  rememberMe = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

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
  }

  async handleLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.generalError = '';

    try {
      const formData = this.loginForm.value;
      await this.authService.login({
        email: formData.email,
        password: formData.password,
        rememberMe: this.rememberMe,
      });

      // Redirect to dashboard on successful login
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.generalError = error.message || 'Login failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  async handleOAuthLogin(
    provider: 'google' | 'github' | 'microsoft',
  ): Promise<void> {
    try {
      // Simulate OAuth redirect to mock OAuth endpoint
      const redirectUri = encodeURIComponent(
        window.location.origin + '/auth/callback',
      );
      window.location.href = `/auth/mock-oauth?provider=${provider}&redirect_uri=${redirectUri}`;
    } catch (error: any) {
      this.generalError =
        error.message || 'OAuth login failed. Please try again.';
    }
  }

  onRememberMeChange(checked: boolean): void {
    this.rememberMe = checked;
  }
}
