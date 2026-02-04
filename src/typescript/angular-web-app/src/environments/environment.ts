// Environment configuration for development
export const environment = {
  production: false,

  // OAuth Configuration
  oauth: {
    // Mock OAuth for development
    google: {
      clientId: 'mock_google_client_id',
      scope: 'openid profile email',
    },
    github: {
      clientId: 'mock_github_client_id',
      scope: 'user:email',
    },
    microsoft: {
      clientId: 'mock_microsoft_client_id',
      scope: 'openid profile email',
    },
  },

  // API Configuration
  api: {
    baseUrl: 'http://localhost:4200',
  },

  // Session Configuration
  session: {
    timeout: 3600000, // 1 hour in milliseconds
    remember: true,
    mockOAuth: true, // Enable mock OAuth in development
  },
};
