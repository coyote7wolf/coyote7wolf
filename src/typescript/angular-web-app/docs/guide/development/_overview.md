# 📚 Development Guide

Local development environment setup, project structure, and development workflow.

## 📋 This Section Contains

- [Environment Setup](./environment-setup.md) - Development environment configuration
- [Project Structure](./project-structure.md) - Code organization and naming conventions
- [Component Architecture](./component-architecture.md) - Smart/Dumb component patterns- [Navbar Improvements](./navbar-improvements.md) - Navbar design and implementation- [Development Workflow](./workflow.md) - Daily development process
- [Testing Guide](./testing.md) - Writing and running tests

## 🎯 Quick Navigation

| I want to...                  | See this guide                                        |
| ----------------------------- | ----------------------------------------------------- |
| Setup development environment | [Environment Setup](./environment-setup.md)           |
| Understand code organization  | [Project Structure](./project-structure.md)           |
| Learn component patterns      | [Component Architecture](./component-architecture.md) |
| Start coding                  | [Development Workflow](./workflow.md)                 |
| Write tests                   | [Testing Guide](./testing.md)                         |

## 🏗️ Architecture Overview

This project uses **Container/Presentational (Smart/Dumb)** component pattern combined with **lazy loading**:

- **Container Components**: Manage state and business logic
- **Presentational Components**: Pure UI rendering
- **Lazy Loading**: Load features on-demand
- **Code Splitting**: Automatic chunk generation
- **Shared Navbar**: Reusable navigation component across pages

Learn more in [Component Architecture](./component-architecture.md) and [Navbar Improvements](./navbar-improvements.md)

## ⏱️ Time Investment

- Setup development environment: 15 minutes
- Understand project structure: 20 minutes
- Learn component patterns: 30 minutes
- Develop first feature: 1-2 hours

## 👥 This Section is For

- New developers joining the project
- Anyone wanting to contribute code
- Those learning Angular best practices
- Developers interested in architecture patterns

---

**Start here**: [Environment Setup](./environment-setup.md)
