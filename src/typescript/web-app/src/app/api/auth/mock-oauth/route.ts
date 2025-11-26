import { NextRequest, NextResponse } from 'next/server'

/**
 * Mock OAuth Authentication Route
 *
 * Simulates OAuth flow for development and testing purposes
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const provider = searchParams.get('provider') || 'google'
  const action = searchParams.get('action') || 'login'

  // Simulate OAuth authorization page
  const authPage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mock OAuth - ${provider.charAt(0).toUpperCase() + provider.slice(1)}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        .provider-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
        }
        .google { background: #4285f4; }
        .github { background: #333; }
        .microsoft { background: #00a1f1; }
        h2 { margin: 0 0 10px; color: #333; }
        p { color: #666; margin-bottom: 30px; }
        .permissions {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: left;
        }
        .permissions h3 {
          margin: 0 0 15px;
          font-size: 16px;
          color: #333;
        }
        .permissions ul {
          margin: 0;
          padding-left: 20px;
          color: #666;
        }
        .permissions li {
          margin-bottom: 8px;
        }
        .buttons {
          display: flex;
          gap: 12px;
          margin-top: 30px;
        }
        button {
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .allow {
          background: #10b981;
          color: white;
        }
        .allow:hover {
          background: #059669;
        }
        .deny {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }
        .deny:hover {
          background: #e5e7eb;
        }
        .app-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding: 15px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        .app-icon {
          width: 40px;
          height: 40px;
          background: #3b82f6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="provider-icon ${provider}">
          ${provider === 'google' ? 'G' : provider === 'github' ? '🐙' : 'Ⓜ'}
        </div>
        
        <h2>Authorize SyncCoreAI</h2>
        <p>SyncCoreAI would like to access your ${provider.charAt(0).toUpperCase() + provider.slice(1)} account</p>
        
        <div class="app-info">
          <div class="app-icon">S</div>
          <div>
            <strong>SyncCoreAI</strong><br>
            <small>Collaborative Document Platform</small>
          </div>
        </div>
        
        <div class="permissions">
          <h3>This application will be able to:</h3>
          <ul>
            <li>View your basic profile information</li>
            <li>Access your email address</li>
            <li>Create and manage your account</li>
          </ul>
        </div>
        
        <div class="buttons">
          <button class="deny" onclick="handleDeny()">Cancel</button>
          <button class="allow" onclick="handleAllow()">Authorize</button>
        </div>
      </div>
      
      <script>
        function handleAllow() {
          // Simulate successful OAuth flow
          const mockCode = 'mock_auth_code_' + Math.random().toString(36).substr(2, 9);
          const redirectUrl = '/api/auth/callback?code=' + mockCode + '&provider=${provider}&action=${action}';
          window.location.href = redirectUrl;
        }
        
        function handleDeny() {
          // Redirect back to login/register with error
          const returnUrl = '${action}' === 'register' ? '/register' : '/login';
          window.location.href = returnUrl + '?error=access_denied';
        }
      </script>
    </body>
    </html>
  `

  return new NextResponse(authPage, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}
