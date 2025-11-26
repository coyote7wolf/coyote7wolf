import { NextRequest, NextResponse } from 'next/server'

/**
 * OAuth Callback Route
 *
 * Handles OAuth callback and creates mock user session
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const provider = searchParams.get('provider') || 'google'
  const action = searchParams.get('action') || 'login'

  if (!code) {
    // Handle OAuth error
    const returnUrl = action === 'register' ? '/register' : '/login'
    return NextResponse.redirect(
      new URL(`${returnUrl}?error=oauth_failed`, request.url)
    )
  }

  // Simulate processing OAuth code and creating user
  try {
    // Mock user data based on provider
    const mockUsers = {
      google: {
        id: 'google_user_123',
        email: 'user@gmail.com',
        name: 'John Doe',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google_user',
        provider: 'google',
      },
      github: {
        id: 'github_user_456',
        email: 'user@example.com',
        name: 'Jane Smith',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=github_user',
        provider: 'github',
      },
      microsoft: {
        id: 'microsoft_user_789',
        email: 'user@outlook.com',
        name: 'Mike Johnson',
        avatar:
          'https://api.dicebear.com/7.x/avataaars/svg?seed=microsoft_user',
        provider: 'microsoft',
      },
    }

    const mockUser =
      mockUsers[provider as keyof typeof mockUsers] || mockUsers.google

    // Create a success page that automatically redirects
    const successPage = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Authentication Successful</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 100%;
            text-align: center;
          }
          .success-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 40px;
          }
          h2 { margin: 0 0 10px; color: #333; }
          p { color: #666; margin-bottom: 20px; }
          .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #e5e7eb;
            border-top: 2px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✓</div>
          <h2>Authentication Successful!</h2>
          <p>You have successfully ${action === 'register' ? 'registered' : 'signed in'} with ${provider.charAt(0).toUpperCase() + provider.slice(1)}.</p>
          <p>Redirecting to dashboard...</p>
          <div class="spinner"></div>
        </div>
        
        <script>
          // Store mock user data in localStorage for the auth store to pick up
          const mockUser = ${JSON.stringify(mockUser)};
          
          // Transform mockUser to match UserInfo interface
          const userInfo = {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            avatar: mockUser.avatar,
            role: 'USER', // UserRole.USER
            permissions: ['read', 'write'],
            isEmailVerified: true,
            isPremium: false,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            preferences: {
              language: 'en',
              theme: 'light',
              timezone: 'UTC',
              notifications: {
                email: true,
                push: true,
                desktop: true
              }
            }
          };
          
          // Create auth tokens
          const tokens = {
            accessToken: 'mock_access_token_' + Math.random().toString(36).substr(2, 20),
            refreshToken: 'mock_refresh_token_' + Math.random().toString(36).substr(2, 20),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
            tokenType: 'Bearer',
            scopes: ['read', 'write']
          };
          
          // Create auth state matching AuthState interface
          const authState = {
            status: 'AUTHENTICATED',
            user: userInfo,
            tokens: tokens,
            sessionId: 'mock_session_' + Math.random().toString(36).substr(2, 9),
            isRemembered: true,
            lastActivity: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000)
          };
          
          // Simple encrypt function for mock data (in real app this would use proper encryption)
          function simpleEncrypt(data) {
            return btoa(JSON.stringify(data));
          }
          
          // Store using the same keys as authStorage system
          localStorage.setItem('auth_state', simpleEncrypt(authState));
          localStorage.setItem('remember_me', 'true');
          localStorage.setItem('last_activity', Date.now().toString());
          
          // Redirect after a short delay
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        </script>
      </body>
      </html>
    `

    return new NextResponse(successPage, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('OAuth callback error:', error)
    const returnUrl = action === 'register' ? '/register' : '/login'
    return NextResponse.redirect(
      new URL(`${returnUrl}?error=oauth_processing_failed`, request.url)
    )
  }
}
