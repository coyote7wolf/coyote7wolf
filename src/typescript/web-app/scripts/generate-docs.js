#!/usr/bin/env node

/**
 * Documentation Generator Script
 *
 * Generates comprehensive documentation for the mock-first development
 * setup, API services, Redux integration, and development workflows.
 */

const fs = require('fs')
const path = require('path')

const OUTPUT_DIR = path.join(__dirname, '../docs/generated')
const DOCS_DIR = path.join(__dirname, '../docs')

const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString()
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' }
  console.log(`${icons[level]} [${timestamp}] ${message}`)
}

const ensureDir = dirPath => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

const generateApiServiceDocs = () => {
  const apiServicePath = path.join(__dirname, '../src/services/api.ts')

  if (!fs.existsSync(apiServicePath)) {
    log('API service file not found', 'warning')
    return
  }

  const content = fs.readFileSync(apiServicePath, 'utf8')

  // Extract service classes
  const serviceRegex =
    /export class (\w+Service) extends BaseApiService \{([\s\S]*?)\n\}/g
  const services = []
  let match

  while ((match = serviceRegex.exec(content)) !== null) {
    const [, serviceName, serviceContent] = match

    // Extract methods
    const methodRegex = /async (\w+)\([^)]*\)[^{]*\{[\s\S]*?\n  \}/g
    const methods = []
    let methodMatch

    while ((methodMatch = methodRegex.exec(serviceContent)) !== null) {
      methods.push(methodMatch[1])
    }

    services.push({ name: serviceName, methods })
  }

  const docs = `# API Service Documentation

Generated on: ${new Date().toISOString()}

## Overview

The API service layer provides a unified interface for interacting with both mock and real APIs. It automatically switches between mock and production endpoints based on the environment configuration.

## Available Services

${services
  .map(
    service => `
### ${service.name}

**Methods:**
${service.methods.map(method => `- \`${method}()\``).join('\n')}
`
  )
  .join('\n')}

## Usage Examples

### Basic Usage

\`\`\`typescript
import ApiService from '@/services/api'

// Using document service
const documents = await ApiService.document.getDocuments()
const document = await ApiService.document.getDocument('doc_id')

// Using user service
const users = await ApiService.user.getUsers()
const profile = await ApiService.user.getProfile()
\`\`\`

### With Redux

\`\`\`typescript
import { createAsyncThunk } from '@reduxjs/toolkit'
import ApiService from '@/services/api'

export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (params: { limit?: number }) => {
    const response = await ApiService.document.getDocuments(params)
    return response.data
  }
)
\`\`\`

## Environment Configuration

The API service automatically detects the environment mode:

- \`MODE=mock-api\`: Uses JSON Server at localhost:3100
- \`MODE=development\`: Uses development API server
- \`MODE=production\`: Uses production API server

## Error Handling

All API services include consistent error handling:

\`\`\`typescript
try {
  const data = await ApiService.document.getDocument('invalid_id')
} catch (error) {
  if (error.status === 404) {
    console.log('Document not found')
  } else {
    console.log('Unexpected error:', error.message)
  }
}
\`\`\`
`

  const outputPath = path.join(OUTPUT_DIR, 'api-services.md')
  fs.writeFileSync(outputPath, docs)
  log(`API service documentation generated: ${outputPath}`, 'success')
}

const generateReduxDocs = () => {
  const slicesDir = path.join(__dirname, '../src/store/slices')

  if (!fs.existsSync(slicesDir)) {
    log('Redux slices directory not found', 'warning')
    return
  }

  const sliceFiles = fs
    .readdirSync(slicesDir)
    .filter(file => file.endsWith('Slice.ts'))
  const slices = []

  sliceFiles.forEach(file => {
    const filePath = path.join(slicesDir, file)
    const content = fs.readFileSync(filePath, 'utf8')

    // Extract slice name
    const sliceName = file.replace('Slice.ts', '')

    // Extract async thunks
    const thunkRegex = /export const (\w+) = createAsyncThunk/g
    const thunks = []
    let match

    while ((match = thunkRegex.exec(content)) !== null) {
      thunks.push(match[1])
    }

    // Extract slice actions (from reducers)
    const actionRegex = /(\w+): \(state.*?\) => \{/g
    const actions = []

    while ((match = actionRegex.exec(content)) !== null) {
      actions.push(match[1])
    }

    slices.push({ name: sliceName, thunks, actions, file })
  })

  const docs = `# Redux Store Documentation

Generated on: ${new Date().toISOString()}

## Overview

The Redux store is configured with Redux Toolkit and includes slices for managing application state. All slices are integrated with the API service layer for seamless data fetching.

## Available Slices

${slices
  .map(
    slice => `
### ${slice.name}Slice

**File:** \`src/store/slices/${slice.file}\`

**Async Thunks:**
${slice.thunks.map(thunk => `- \`${thunk}\``).join('\n') || '- None'}

**Actions:**
${slice.actions.map(action => `- \`${action}\``).join('\n') || '- None'}
`
  )
  .join('\n')}

## Usage Examples

### Dispatching Actions

\`\`\`typescript
import { useDispatch, useSelector } from 'react-redux'
import { fetchDocuments } from '@/store/slices/documentsSlice'
import type { RootState, AppDispatch } from '@/store'

const MyComponent = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { documents, isLoading } = useSelector((state: RootState) => state.documents)

  useEffect(() => {
    dispatch(fetchDocuments({ limit: 10 }))
  }, [dispatch])

  return (
    <div>
      {isLoading ? 'Loading...' : documents.map(doc => (
        <div key={doc.id}>{doc.title}</div>
      ))}
    </div>
  )
}
\`\`\`

### Selecting State

\`\`\`typescript
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'

// Select specific data
const documents = useSelector((state: RootState) => state.documents.documents)
const isLoading = useSelector((state: RootState) => state.documents.isLoading)

// Select with transformation
const documentTitles = useSelector((state: RootState) => 
  state.documents.documents.map(doc => doc.title)
)
\`\`\`

## Best Practices

1. **Type Safety**: Always use typed selectors and dispatch
2. **Error Handling**: Handle rejected states in async thunks
3. **Loading States**: Use loading flags for better UX
4. **Normalization**: Consider normalizing data for complex relationships
5. **Performance**: Use \`createSelector\` for expensive computations
`

  const outputPath = path.join(OUTPUT_DIR, 'redux-store.md')
  fs.writeFileSync(outputPath, docs)
  log(`Redux documentation generated: ${outputPath}`, 'success')
}

const generateMockDataDocs = () => {
  const dbPath = path.join(__dirname, '../src/mocks/db.json')

  let dbStats = {}
  if (fs.existsSync(dbPath)) {
    try {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
      dbStats = Object.entries(db).reduce((acc, [key, value]) => {
        if (Array.isArray(value)) {
          acc[key] = value.length
        } else if (typeof value === 'object' && value !== null) {
          acc[key] = Object.keys(value).length
        } else {
          acc[key] = 'scalar'
        }
        return acc
      }, {})
    } catch (error) {
      log(`Failed to parse database: ${error.message}`, 'warning')
    }
  }

  const docs = `# Mock Data Documentation

Generated on: ${new Date().toISOString()}

## Overview

The mock data system provides comprehensive test data for development and testing. It uses JSON Server to simulate a REST API with realistic data relationships.

## Database Structure

${Object.entries(dbStats)
  .map(
    ([table, count]) => `
### ${table}
${typeof count === 'number' ? `Records: ${count}` : 'Type: ' + count}
`
  )
  .join('\n')}

## API Endpoints

The mock server provides the following endpoints:

### Authentication
- \`POST /api/v1/auth/login\` - User login
- \`POST /api/v1/auth/logout\` - User logout
- \`POST /api/v1/auth/refresh\` - Refresh token

### Users
- \`GET /api/v1/users\` - List all users
- \`GET /api/v1/users/:id\` - Get user by ID
- \`PUT /api/v1/users/:id\` - Update user
- \`GET /api/v1/users/:id/profile\` - Get user profile

### Documents
- \`GET /api/v1/documents\` - List documents
- \`POST /api/v1/documents\` - Create document
- \`GET /api/v1/documents/:id\` - Get document
- \`PUT /api/v1/documents/:id\` - Update document
- \`DELETE /api/v1/documents/:id\` - Delete document

### Workspaces
- \`GET /api/v1/workspaces\` - List workspaces
- \`POST /api/v1/workspaces\` - Create workspace
- \`GET /api/v1/workspaces/:id\` - Get workspace
- \`PUT /api/v1/workspaces/:id\` - Update workspace

### Templates
- \`GET /api/v1/templates\` - List templates
- \`POST /api/v1/templates\` - Create template
- \`GET /api/v1/templates/:id\` - Get template
- \`POST /api/v1/templates/:id/use\` - Use template

### Activities
- \`GET /api/v1/activities\` - List activities
- \`POST /api/v1/activities\` - Create activity
- \`GET /api/v1/activities/user/:userId\` - Get user activities
- \`GET /api/v1/activities/stats\` - Get activity statistics

## Data Seeding

### Available Commands

\`\`\`bash
# Full seed with comprehensive data
npm run seed-data

# Reset and seed fresh data
npm run seed-data:reset

# Minimal seed for performance testing
npm run seed-data:minimal
\`\`\`

### Custom Seeding

You can customize the seeding process by modifying \`scripts/seed-data.js\`:

\`\`\`javascript
// Generate custom data
const customUsers = generateUsers(20)
const customDocuments = generateDocuments(users, workspaces, 50)
\`\`\`

## Development Workflow

### Starting Development

\`\`\`bash
# Full development setup with fresh data
npm run dev:full

# Development with existing data
npm run dev:mock-api

# Minimal setup for performance
npm run dev:minimal
\`\`\`

### Data Management

\`\`\`bash
# Check system health
npm run health

# Reset mock data
npm run seed-data:reset

# View mock server logs
npm run mock-server:verbose
\`\`\`

## Mock Server Configuration

The mock server runs on port 3100 with the following features:

- **Auto-reload**: Watches for changes in \`db.json\`
- **Custom routes**: Defined in \`src/mocks/servers/routes.json\`
- **Middleware**: Custom logic in \`src/mocks/servers/middleware.js\`
- **CORS**: Enabled for cross-origin requests

## Best Practices

1. **Data Consistency**: Maintain referential integrity between entities
2. **Realistic Data**: Use meaningful names and content
3. **Performance**: Use minimal mode for performance testing
4. **Testing**: Seed specific data for test scenarios
5. **Backup**: Always backup data before major changes
`

  const outputPath = path.join(OUTPUT_DIR, 'mock-data.md')
  fs.writeFileSync(outputPath, docs)
  log(`Mock data documentation generated: ${outputPath}`, 'success')
}

const generateDevelopmentWorkflowDocs = () => {
  const packageJsonPath = path.join(__dirname, '../package.json')
  let scripts = {}

  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      scripts = packageJson.scripts || {}
    } catch (error) {
      log(`Failed to parse package.json: ${error.message}`, 'warning')
    }
  }

  const docs = `# Development Workflow Documentation

Generated on: ${new Date().toISOString()}

## Overview

This document outlines the development workflow for the SyncCoreAI web application, including setup, development modes, testing, and deployment procedures.

## Quick Start

### First Time Setup

\`\`\`bash
# Clone and setup
git clone <repository-url>
cd syncCoreAI-web-app

# Install dependencies and setup mock data
npm run setup

# Start development with mock API
npm run dev:full
\`\`\`

### Daily Development

\`\`\`bash
# Start development (uses existing data)
npm run dev:mock-api

# Or start with fresh data
npm run dev:reset

# Check system health
npm run health
\`\`\`

## Available Scripts

${Object.entries(scripts)
  .map(
    ([script, command]) => `
### \`npm run ${script}\`
\`\`\`bash
${command}
\`\`\`
`
  )
  .join('\n')}

## Development Modes

### Mock API Mode (\`MODE=mock-api\`)
- Uses JSON Server for API simulation
- Port 3100 for mock server, 3000 for Next.js
- Realistic data relationships
- Full CRUD operations supported

### Development Mode (\`MODE=development\`)
- Connects to development backend
- Real API endpoints
- Database integration

### Production Mode (\`MODE=production\`)
- Production optimized build
- Real API endpoints
- Performance monitoring

## File Structure

\`\`\`
src/
├── services/
│   └── api.ts              # API service layer
├── store/
│   ├── index.ts            # Redux store configuration
│   └── slices/             # Redux slices
├── mocks/
│   ├── db.json             # Mock database
│   ├── servers/            # Mock server configuration
│   └── data/               # Additional mock data
└── components/             # React components

scripts/
├── seed-data.js            # Data seeding script
├── health-check.js         # System health checks
└── generate-docs.js        # Documentation generator
\`\`\`

## Testing Strategy

### Unit Tests
\`\`\`bash
npm run test
npm run test:watch
npm run test:coverage
\`\`\`

### Integration Tests
\`\`\`bash
npm run test:mock
\`\`\`

### Type Checking
\`\`\`bash
npm run type-check
npm run type-check:watch
\`\`\`

## Code Quality

### Linting and Formatting
\`\`\`bash
npm run lint
npm run lint:fix
npm run format
npm run format:check
\`\`\`

### Pre-commit Checks
\`\`\`bash
npm run pre-commit
\`\`\`

## Debugging

### Development Debugging
\`\`\`bash
npm run debug
npm run debug:mock
\`\`\`

### Performance Analysis
\`\`\`bash
npm run build:analyze
\`\`\`

## Deployment

### Static Build
\`\`\`bash
npm run build:static
\`\`\`

### Production Build
\`\`\`bash
npm run build
npm run start
\`\`\`

## Troubleshooting

### Common Issues

1. **Mock server not starting**
   - Check if port 3100 is available
   - Verify \`db.json\` exists and is valid
   - Run \`npm run health\` for diagnostics

2. **API endpoints returning 404**
   - Ensure mock server is running
   - Check \`routes.json\` configuration
   - Verify endpoint URLs in API service

3. **Redux state not updating**
   - Check async thunk implementations
   - Verify API service integration
   - Review Redux DevTools

4. **TypeScript errors**
   - Run \`npm run type-check\`
   - Update type definitions
   - Check API service type definitions

### Health Checks

\`\`\`bash
npm run health
\`\`\`

This command checks:
- Mock database integrity
- Environment variables
- Dependencies
- Server connectivity
- API endpoint availability

## Best Practices

### Development
1. Always run health checks before starting work
2. Use meaningful commit messages
3. Run pre-commit checks before pushing
4. Keep mock data realistic and consistent

### API Integration
1. Use the API service layer for all requests
2. Handle errors consistently
3. Implement proper loading states
4. Test with both mock and real APIs

### State Management
1. Use typed Redux selectors
2. Handle async states properly
3. Normalize complex data structures
4. Keep actions pure and predictable

### Testing
1. Write tests for critical paths
2. Mock external dependencies
3. Test error scenarios
4. Maintain good test coverage
`

  const outputPath = path.join(OUTPUT_DIR, 'development-workflow.md')
  fs.writeFileSync(outputPath, docs)
  log(`Development workflow documentation generated: ${outputPath}`, 'success')
}

const generateMainReadme = () => {
  const content = [
    '# SyncCoreAI Web Application',
    '',
    '## Overview',
    '',
    'A collaborative document editing platform with AI assistance, built with Next.js 14, TypeScript, and Redux Toolkit. Features comprehensive mock-first development workflow for rapid iteration.',
    '',
    '## Quick Start',
    '',
    '```bash',
    '# Setup and start development',
    'npm run setup',
    'npm run dev:full',
    '```',
    '',
    'Open [http://localhost:3000](http://localhost:3000) in your browser.',
    '',
    '## Features',
    '',
    '- 🚀 **Mock-First Development**: Complete mock API with realistic data',
    '- 📝 **Document Collaboration**: Real-time editing and sharing',
    '- 🤖 **AI Integration**: Intelligent suggestions and assistance',
    '- 🎨 **Modern UI**: Tailwind CSS with dark/light theme support',
    '- 🔄 **Real-time Sync**: WebSocket-based collaboration',
    '- 📊 **Analytics**: Usage tracking and performance monitoring',
    '- 🔒 **Authentication**: Secure user management',
    '- 📱 **Responsive**: Mobile-first design approach',
    '',
    '## Development Modes',
    '',
    '| Mode | Command | Description |',
    '|------|---------|-------------|',
    '| Mock API | `npm run dev:mock-api` | Uses JSON Server for API simulation |',
    '| Full Setup | `npm run dev:full` | Fresh data + Mock server + Next.js |',
    '| Minimal | `npm run dev:minimal` | Lightweight for performance testing |',
    '| Reset | `npm run dev:reset` | Fresh mock data on each start |',
    '',
    '## Documentation',
    '',
    '- [API Services](./docs/generated/api-services.md) - API integration layer',
    '- [Redux Store](./docs/generated/redux-store.md) - State management guide',
    '- [Mock Data](./docs/generated/mock-data.md) - Mock system overview',
    '- [Development Workflow](./docs/generated/development-workflow.md) - Complete development guide',
    '',
    '## Tech Stack',
    '',
    '### Frontend',
    '- **Next.js 14** - React framework with app router',
    '- **TypeScript** - Type safety and developer experience',
    '- **Tailwind CSS** - Utility-first styling',
    '- **Redux Toolkit** - State management',
    '',
    '### Development',
    '- **JSON Server** - Mock API server',
    '- **Jest** - Testing framework',
    '- **ESLint/Prettier** - Code quality tools',
    '- **Concurrently** - Process management',
    '',
    '## License',
    '',
    'MIT License - see [LICENSE](./LICENSE) for details.',
    '',
    '---',
    '',
    `Generated on: ${new Date().toISOString()}`,
  ]

  const docs = content.join('\n')

  const outputPath = path.join(DOCS_DIR, 'README.md')
  fs.writeFileSync(outputPath, docs)
  log(`Main README generated: ${outputPath}`, 'success')
}

const generateDocs = async () => {
  log('Starting documentation generation...', 'info')

  // Ensure output directories exist
  ensureDir(OUTPUT_DIR)
  ensureDir(DOCS_DIR)

  try {
    // Generate all documentation
    generateApiServiceDocs()
    generateReduxDocs()
    generateMockDataDocs()
    generateDevelopmentWorkflowDocs()
    generateMainReadme()

    log('\\n✅ All documentation generated successfully!', 'success')
    log(`\\n📚 Documentation available at:`, 'info')
    log(`   - Main README: docs/README.md`, 'info')
    log(`   - API Services: docs/generated/api-services.md`, 'info')
    log(`   - Redux Store: docs/generated/redux-store.md`, 'info')
    log(`   - Mock Data: docs/generated/mock-data.md`, 'info')
    log(
      `   - Development Workflow: docs/generated/development-workflow.md`,
      'info'
    )
  } catch (error) {
    log(`Documentation generation failed: ${error.message}`, 'error')
    throw error
  }
}

// Run documentation generation if called directly
if (require.main === module) {
  generateDocs()
    .then(() => {
      log('Documentation generation completed!', 'success')
      process.exit(0)
    })
    .catch(error => {
      log(`Failed to generate documentation: ${error.message}`, 'error')
      process.exit(1)
    })
}

module.exports = { generateDocs }
