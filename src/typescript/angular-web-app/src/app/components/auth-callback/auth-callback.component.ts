import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center"
    >
      <div class="text-center space-y-6">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
        ></div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Logging you in...
          </h2>
          <p class="text-gray-600">
            Redirecting to dashboard in
            <span class="font-semibold text-blue-600">{{ countdown }}</span>
            seconds
          </p>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            class="bg-blue-600 h-full transition-all duration-300"
            [style.width.%]="(countdown / 3) * 100"
          ></div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .animate-spin {
        animation: spin 1s linear infinite;
      }
    `,
  ],
})
export class AuthCallbackComponent implements OnInit {
  countdown: number = 3;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const provider = params['provider'];
      const code = params['code'];
      const state = params['state'];

      if (provider) {
        this.handleMockOAuthCallback(provider);
      } else {
        // If no provider, start countdown and redirect
        this.startCountdown();
      }
    });
  }

  private handleMockOAuthCallback(
    provider: 'google' | 'github' | 'microsoft',
  ): void {
    // Simulate OAuth callback with user data
    const mockUserData = this.getMockUserData(provider);

    this.authService
      .handleOAuthCallback(provider, mockUserData)
      .then(() => {
        this.startCountdown();
      })
      .catch((error) => {
        console.error('OAuth callback error:', error);
        this.startCountdown(() => this.router.navigate(['/login']));
      });
  }

  private startCountdown(onComplete?: () => void): void {
    const interval = setInterval(() => {
      this.countdown--;

      if (this.countdown <= 0) {
        clearInterval(interval);
        if (onComplete) {
          onComplete();
        } else {
          this.router.navigate(['/dashboard']);
        }
      }
    }, 1000);
  }

  private getMockUserData(provider: string) {
    const names: { [key: string]: string } = {
      google: 'Google User',
      github: 'GitHub Developer',
      microsoft: 'Microsoft Account',
    };

    const emails: { [key: string]: string } = {
      google: `user+${Date.now()}@gmail.com`,
      github: `user+${Date.now()}@github.com`,
      microsoft: `user+${Date.now()}@outlook.com`,
    };

    return {
      name: names[provider] || 'OAuth User',
      email: emails[provider] || `user@${provider}.com`,
    };
  }
}
