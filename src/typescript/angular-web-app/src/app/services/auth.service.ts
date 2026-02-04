import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
  provider?: 'email' | 'google' | 'github' | 'microsoft';
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface OAuthProvider {
  provider: 'google' | 'github' | 'microsoft';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(
    this.getStoredUser(),
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    !!this.getStoredUser(),
  );
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const storedUser = this.getStoredUser();
    if (storedUser) {
      this.currentUserSubject.next(storedUser);
      this.isAuthenticatedSubject.next(true);
    }
  }

  /**
   * Email/Password Login
   */
  login(credentials: LoginCredentials): Promise<User> {
    return new Promise((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        // Validate credentials
        if (!this.validateEmail(credentials.email)) {
          reject(new Error('Please enter a valid email address'));
          return;
        }

        if (credentials.password.length < 6) {
          reject(new Error('Password must be at least 6 characters'));
          return;
        }

        // Simulate user creation/retrieval
        const user: User = {
          id: 'user_' + Math.random().toString(36).substr(2, 9),
          email: credentials.email,
          name: credentials.email.split('@')[0],
          provider: 'email',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.email}`,
        };

        this.setAuthState(user, credentials.rememberMe);
        resolve(user);
      }, 800);
    });
  }

  /**
   * OAuth Login Handler
   */
  handleOAuthCallback(
    provider: 'google' | 'github' | 'microsoft',
    userData: Partial<User>,
  ): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = {
          id: 'oauth_' + Math.random().toString(36).substr(2, 9),
          email: userData.email || `${provider}@example.com`,
          name: userData.name || `${provider} User`,
          provider: provider,
          avatar:
            userData.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
        };

        this.setAuthState(user, true);
        resolve(user);
      }, 800);
    });
  }

  /**
   * Logout
   */
  logout(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_remember');
  }

  /**
   * Get Current User
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Private helper methods
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
  }

  private setAuthState(user: User, rememberMe: boolean): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    localStorage.setItem('auth_user', JSON.stringify(user));
    if (rememberMe) {
      localStorage.setItem('auth_remember', 'true');
    }
  }

  private getStoredUser(): User | null {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  }
}
