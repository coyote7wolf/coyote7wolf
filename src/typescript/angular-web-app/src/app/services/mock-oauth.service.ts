import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MockOAuthRequest {
  provider: 'google' | 'github' | 'microsoft';
  redirect_uri: string;
  state?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MockOAuthService {
  private mockOAuthEndpoint = '/api/auth/mock-oauth';

  constructor(private http: HttpClient) {}

  /**
   * Initiate mock OAuth flow
   */
  initiateMockOAuth(provider: 'google' | 'github' | 'microsoft'): void {
    const redirectUri = encodeURIComponent(
      window.location.origin + '/auth/callback',
    );
    const state = this.generateState();

    // Store state for validation
    sessionStorage.setItem('oauth_state', state);

    // Redirect to mock OAuth endpoint
    window.location.href = `${this.mockOAuthEndpoint}?provider=${provider}&redirect_uri=${redirectUri}&state=${state}`;
  }

  /**
   * Generate random state for CSRF protection
   */
  private generateState(): string {
    return Math.random().toString(36).substring(7) + Date.now().toString(36);
  }

  /**
   * Verify OAuth state
   */
  verifyState(state: string): boolean {
    const storedState = sessionStorage.getItem('oauth_state');
    return storedState === state;
  }

  /**
   * Mock OAuth provider endpoints (for demonstration)
   */
  getMockProviderData(provider: 'google' | 'github' | 'microsoft') {
    const providers: {
      [key: string]: { name: string; email: string; avatar: string };
    } = {
      google: {
        name: 'Google User',
        email: `google-user-${Date.now()}@gmail.com`,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
      },
      github: {
        name: 'GitHub Developer',
        email: `github-user-${Date.now()}@github.com`,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=github',
      },
      microsoft: {
        name: 'Microsoft User',
        email: `microsoft-user-${Date.now()}@outlook.com`,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=microsoft',
      },
    };

    return providers[provider] || providers.google;
  }
}
