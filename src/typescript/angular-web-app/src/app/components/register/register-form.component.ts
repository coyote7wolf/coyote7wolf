import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    NavbarComponent,
  ],
  template: `
    <app-navbar></app-navbar>

    <div
      class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-8"
    >
      <div class="relative w-full max-w-md">
        <!-- Background decoration -->
        <div
          class="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-lg"
        >
          <div
            class="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-50 blur-3xl"
          ></div>
          <div
            class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-50 blur-3xl"
          ></div>
        </div>

        <div class="relative z-10">
          <!-- Register Card -->
          <div class="bg-white rounded-lg shadow-lg p-6 sm:p-8">
            <!-- Header -->
            <div class="text-center mb-8">
              <h1 class="text-3xl font-bold text-blue-600 mb-2">
                {{ 'register.title' | translate }}
              </h1>
              <p class="text-gray-600">
                {{ 'register.subtitle' | translate }}
              </p>
            </div>

            <!-- Alert Messages -->
            <div
              *ngIf="generalError"
              class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
            >
              {{ generalError }}
            </div>

            <!-- Register Form -->
            <form [formGroup]="registerForm" (ngSubmit)="handleRegister()">
              <!-- Full Name Field -->
              <div class="mb-4">
                <label
                  for="fullName"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  {{ 'register.fullName' | translate }}
                </label>
                <input
                  id="fullName"
                  formControlName="fullName"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  [class.border-red-500]="
                    fullName?.invalid && fullName?.touched
                  "
                  placeholder="John Doe"
                />
                <p
                  *ngIf="fullName?.invalid && fullName?.touched"
                  class="text-red-500 text-xs mt-1"
                >
                  {{ 'register.fullNameRequired' | translate }}
                </p>
              </div>

              <!-- Email Field -->
              <div class="mb-4">
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  {{ 'login.email' | translate }}
                </label>
                <input
                  id="email"
                  formControlName="email"
                  type="email"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  [class.border-red-500]="email?.invalid && email?.touched"
                  (change)="onEmailChange()"
                  placeholder="example@example.com"
                />
                <p
                  *ngIf="email?.hasError('required') && email?.touched"
                  class="text-red-500 text-xs mt-1"
                >
                  {{ 'login.emailRequired' | translate }}
                </p>
                <p
                  *ngIf="email?.hasError('email') && email?.touched"
                  class="text-red-500 text-xs mt-1"
                >
                  {{ 'login.emailInvalid' | translate }}
                </p>
              </div>

              <!-- Password Field -->
              <div class="mb-4">
                <label
                  for="password"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  {{ 'login.password' | translate }}
                </label>
                <input
                  id="password"
                  formControlName="password"
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  [class.border-red-500]="
                    password?.invalid && password?.touched
                  "
                  placeholder="••••••••"
                />
                <p
                  *ngIf="password?.hasError('required') && password?.touched"
                  class="text-red-500 text-xs mt-1"
                >
                  {{ 'login.passwordRequired' | translate }}
                </p>
                <p
                  *ngIf="password?.hasError('minlength') && password?.touched"
                  class="text-red-500 text-xs mt-1"
                >
                  {{ 'register.passwordMinLength' | translate }}
                </p>
              </div>

              <!-- Confirm Password Field -->
              <div class="mb-6">
                <label
                  for="confirmPassword"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  {{ 'register.confirmPassword' | translate }}
                </label>
                <input
                  id="confirmPassword"
                  formControlName="confirmPassword"
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  [class.border-red-500]="
                    confirmPassword?.invalid && confirmPassword?.touched
                  "
                  placeholder="••••••••"
                />
                <p
                  *ngIf="
                    confirmPassword?.hasError('required') &&
                    confirmPassword?.touched
                  "
                  class="text-red-500 text-xs mt-1"
                >
                  {{ 'register.confirmPasswordRequired' | translate }}
                </p>
                <p
                  *ngIf="
                    registerForm.hasError('passwordMismatch') &&
                    confirmPassword?.touched
                  "
                  class="text-red-500 text-xs mt-1"
                >
                  {{ 'register.passwordMismatch' | translate }}
                </p>
              </div>

              <!-- Terms Checkbox -->
              <div class="mb-6">
                <label class="flex items-center">
                  <input
                    formControlName="agreeTerms"
                    type="checkbox"
                    class="rounded border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">
                    {{ 'register.agreeTerms' | translate }}
                  </span>
                </label>
                <p
                  *ngIf="agreeTerms?.invalid && agreeTerms?.touched"
                  class="text-red-500 text-xs mt-1"
                >
                  {{ 'register.agreeTermsRequired' | translate }}
                </p>
              </div>

              <!-- Register Button -->
              <button
                type="submit"
                [disabled]="registerForm.invalid || isLoading"
                class="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span *ngIf="!isLoading">
                  {{ 'register.registerButton' | translate }}
                </span>
                <span
                  *ngIf="isLoading"
                  class="flex items-center justify-center"
                >
                  <span
                    class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  ></span>
                  {{ 'register.registering' | translate }}
                </span>
              </button>
            </form>

            <!-- Login Link -->
            <p class="text-center mt-6 text-gray-600">
              {{ 'register.haveAccount' | translate }}
              <a
                routerLink="/login"
                class="text-blue-600 hover:text-blue-700 font-semibold"
              >
                {{ 'register.loginLink' | translate }}
              </a>
            </p>

            <!-- OAuth Options -->
            <div class="mt-8 pt-6 border-t border-gray-200">
              <p class="text-center text-sm text-gray-600 mb-4">
                {{ 'register.orRegisterWith' | translate }}
              </p>
              <div class="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  (click)="handleOAuthRegister('google')"
                  [disabled]="isLoading"
                  class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium disabled:opacity-50"
                >
                  Google
                </button>
                <button
                  type="button"
                  (click)="handleOAuthRegister('github')"
                  [disabled]="isLoading"
                  class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium disabled:opacity-50"
                >
                  GitHub
                </button>
                <button
                  type="button"
                  (click)="handleOAuthRegister('microsoft')"
                  [disabled]="isLoading"
                  class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium disabled:opacity-50"
                >
                  Microsoft
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class RegisterFormComponent {
  @Input() registerForm!: FormGroup;
  @Input() isLoading = false;
  @Input() generalError = '';

  @Output() registerSubmit = new EventEmitter<void>();
  @Output() oauthRegister = new EventEmitter<
    'google' | 'github' | 'microsoft'
  >();
  @Output() emailChange = new EventEmitter<void>();

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
    this.emailChange.emit();
  }

  handleRegister(): void {
    if (this.registerForm.invalid) {
      return;
    }
    this.registerSubmit.emit();
  }

  handleOAuthRegister(provider: 'google' | 'github' | 'microsoft'): void {
    this.oauthRegister.emit(provider);
  }
}
