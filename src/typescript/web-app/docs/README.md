# SyncCoreAI Web Application

## Overview

A collaborative document editing platform with AI assistance, built with Next.js 14, TypeScript, and Redux Toolkit. Features comprehensive mock-first development workflow for rapid iteration.

## Quick Start

```bash
# Setup and start development
npm run setup
npm run dev:full
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- 🚀 **Mock-First Development**: Complete mock API with realistic data
- 📝 **Document Collaboration**: Real-time editing and sharing
- 🤖 **AI Integration**: Intelligent suggestions and assistance
- 🎨 **Modern UI**: Tailwind CSS with dark/light theme support
- 🔄 **Real-time Sync**: WebSocket-based collaboration
- 📊 **Analytics**: Usage tracking and performance monitoring
- 🔒 **Authentication**: Secure user management
- 📱 **Responsive**: Mobile-first design approach

## Development Modes

| Mode | Command | Description |
|------|---------|-------------|
| Mock API | `npm run dev:mock-api` | Uses JSON Server for API simulation |
| Full Setup | `npm run dev:full` | Fresh data + Mock server + Next.js |
| Minimal | `npm run dev:minimal` | Lightweight for performance testing |
| Reset | `npm run dev:reset` | Fresh mock data on each start |

## Documentation

- [API Services](./docs/generated/api-services.md) - API integration layer
- [Redux Store](./docs/generated/redux-store.md) - State management guide
- [Mock Data](./docs/generated/mock-data.md) - Mock system overview
- [Development Workflow](./docs/generated/development-workflow.md) - Complete development guide

## Tech Stack

### Frontend
- **Next.js 14** - React framework with app router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first styling
- **Redux Toolkit** - State management

### Development
- **JSON Server** - Mock API server
- **Jest** - Testing framework
- **ESLint/Prettier** - Code quality tools
- **Concurrently** - Process management

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

Generated on: 2025-11-09T10:16:17.151Z