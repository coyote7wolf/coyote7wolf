import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';

interface MockOAuthProvider {
  name: string;
  logo: string;
  email: string;
  description: string;
}

@Component({
  selector: 'app-mock-oauth',
  standalone: true,
  imports: [CommonModule, TranslateModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div
      class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-8"
    >
      <!-- Background decoration -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          class="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-50 blur-3xl"
        ></div>
        <div
          class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-50 blur-3xl"
        ></div>
      </div>

      <div class="relative w-full max-w-md">
        <!-- Mock OAuth Card -->
        <div class="bg-white rounded-lg shadow-lg p-6 sm:p-8 space-y-6">
          <!-- Header -->
          <div class="text-center">
            <h1 class="text-3xl font-bold text-blue-600 mb-2">
              {{ provider?.name || 'OAuth Provider' }}
            </h1>
            <p class="text-gray-600">{{ provider?.description }}</p>
          </div>

          <!-- Provider Info Card -->
          <div
            class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"
          >
            <p class="text-sm text-gray-700 mb-2">Mock OAuth Simulation</p>
            <p class="text-lg font-semibold text-blue-600">
              {{ provider?.email }}
            </p>
          </div>

          <!-- Permissions Request -->
          <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <p class="font-semibold text-gray-800">Requested Permissions:</p>
            <ul class="space-y-2 text-sm text-gray-700">
              <li class="flex items-center gap-2">
                <span class="text-green-600">✓</span> Read your email
              </li>
              <li class="flex items-center gap-2">
                <span class="text-green-600">✓</span> Access your profile
              </li>
              <li class="flex items-center gap-2">
                <span class="text-green-600">✓</span> Get your display name
              </li>
            </ul>
          </div>

          <!-- Info Text -->
          <div
            class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700"
          >
            <p>
              <strong>Note:</strong> This is a mock OAuth flow for demonstration
              purposes. No actual authentication occurs.
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-3">
            <button
              (click)="authorizeOAuth()"
              class="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition"
            >
              Authorize & Continue
            </button>

            <button
              (click)="cancel()"
              class="w-full px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>

          <!-- Footer Info -->
          <p class="text-xs text-center text-gray-500">
            You will be redirected back to the application after authorization.
          </p>
        </div>

        <!-- Additional Info -->
        <div
          class="mt-6 bg-white bg-opacity-50 backdrop-blur rounded-lg p-4 text-center text-sm text-gray-600"
        >
          <p>
            This OAuth flow is simulated for demonstration. In production, this
            would use real OAuth 2.0 providers.
          </p>
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
export class MockOAuthComponent implements OnInit {
  provider: MockOAuthProvider | null = null;
  selectedProvider: string = '';

  private providers: Record<string, MockOAuthProvider> = {
    google: {
      name: 'Google',
      logo: '🔵',
      email: 'example@gmail.com',
      description: 'Sign in with your Google account',
    },
    github: {
      name: 'GitHub',
      logo: '⬛',
      email: 'user@github.com',
      description: 'Sign in with your GitHub account',
    },
    microsoft: {
      name: 'Microsoft',
      logo: '🟦',
      email: 'user@outlook.com',
      description: 'Sign in with your Microsoft account',
    },
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Get provider from query parameters
    this.route.queryParams.subscribe((params) => {
      const provider = params['provider'];
      const redirectUri = params['redirect_uri'];

      if (provider && this.providers[provider]) {
        this.selectedProvider = provider;
        this.provider = this.providers[provider];
        // Store redirect_uri for later use
        sessionStorage.setItem('oauth_redirect_uri', redirectUri);
      } else {
        // Redirect back if no valid provider
        this.cancel();
      }
    });
  }

  authorizeOAuth(): void {
    // Simulate OAuth authorization
    const redirectUri = sessionStorage.getItem('oauth_redirect_uri');

    // Simulate successful OAuth flow
    const mockUser = {
      id: `${this.selectedProvider}_${Math.random().toString(36).substr(2, 9)}`,
      email: this.provider?.email || 'user@example.com',
      name: this.provider?.name || 'User',
      provider: this.selectedProvider,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.selectedProvider}`,
    };

    // Store the mock OAuth result
    sessionStorage.setItem('oauth_user', JSON.stringify(mockUser));

    // Simulate a short delay for realistic feel
    setTimeout(() => {
      if (redirectUri) {
        // Redirect back to callback with mock authorization code
        window.location.href =
          redirectUri + '?code=mock_auth_code_' + Math.random().toString(36);
      } else {
        // Fallback: redirect to dashboard
        this.router.navigate(['/dashboard']);
      }
    }, 500);
  }

  cancel(): void {
    // Clear session storage
    sessionStorage.removeItem('oauth_redirect_uri');
    sessionStorage.removeItem('oauth_user');

    // Redirect back to login
    this.router.navigate(['/login']);
  }
}
