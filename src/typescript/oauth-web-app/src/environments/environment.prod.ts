// Environment configuration for production
export const environment = {
  production: true,

  // OAuth Configuration
  oauth: {
    // These would be replaced with real OAuth provider credentials
    google: {
      clientId: 'YOUR_GOOGLE_CLIENT_ID',
      scope: 'openid profile email',
    },
    github: {
      clientId: 'YOUR_GITHUB_CLIENT_ID',
      scope: 'user:email',
    },
    microsoft: {
      clientId: 'YOUR_MICROSOFT_CLIENT_ID',
      scope: 'openid profile email',
    },
  },

  // API Configuration
  api: {
    baseUrl: 'https://api.example.com',
  },

  // Session Configuration
  session: {
    timeout: 3600000, // 1 hour in milliseconds
    remember: true,
  },
};
