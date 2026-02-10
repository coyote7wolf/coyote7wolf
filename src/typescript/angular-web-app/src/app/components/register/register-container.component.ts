import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RegisterFormComponent } from './register-form.component';

@Component({
  selector: 'app-register-container',
  standalone: true,
  imports: [RegisterFormComponent],
  template: `
    <app-register-form
      [registerForm]="registerForm"
      [isLoading]="isLoading"
      [generalError]="generalError"
      (registerSubmit)="handleRegister()"
      (oauthRegister)="handleOAuthRegister($event)"
      (emailChange)="onEmailChange()"
    ></app-register-form>
  `,
})
export class RegisterContainerComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  generalError = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group(
      {
        fullName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        agreeTerms: [false, [Validators.requiredTrue]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  private passwordMatchValidator(
    control: AbstractControl,
  ): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      return { passwordMismatch: true };
    }

    return null;
  }

  get fullName() {
    return this.registerForm.get('fullName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get agreeTerms() {
    return this.registerForm.get('agreeTerms');
  }

  onEmailChange(): void {
    if (this.email?.hasError('email') || this.email?.hasError('required')) {
      // Keep error
    } else {
      this.email?.setErrors(null);
    }
  }

  async handleRegister(): Promise<void> {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.generalError = '';

    try {
      const formData = this.registerForm.value;

      // Simulate successful registration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success message
      this.translate.get('register.success').subscribe((message) => {
        console.log('Registration successful:', message);
      });

      // Redirect to login
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 500);
    } catch (error: any) {
      this.generalError =
        error.message || 'Registration failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  async handleOAuthRegister(
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
        error.message || 'OAuth registration failed. Please try again.';
    }
  }
}
