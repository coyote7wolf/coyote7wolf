#!/usr/bin/env node

/**
 * Health Check Script
 *
 * Performs comprehensive health checks for the development environment
 * including mock server status, API endpoints, and data integrity.
 */

const fs = require('fs')
const path = require('path')
const http = require('http')

const CONFIG = {
  mockServerUrl: 'http://localhost:3100',
  nextServerUrl: 'http://localhost:3000',
  dbPath: path.join(__dirname, '../src/mocks/db.json'),
  timeout: 5000,
}

const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString()
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' }
  console.log(`${icons[level]} [${timestamp}] ${message}`)
}

const checkUrl = (url, name) => {
  return new Promise(resolve => {
    const request = http.get(url, { timeout: CONFIG.timeout }, res => {
      if (res.statusCode === 200) {
        log(`${name} is running (${res.statusCode})`, 'success')
        resolve({ name, status: 'healthy', statusCode: res.statusCode })
      } else {
        log(`${name} returned status ${res.statusCode}`, 'warning')
        resolve({ name, status: 'unhealthy', statusCode: res.statusCode })
      }
    })

    request.on('error', error => {
      log(`${name} is not accessible: ${error.message}`, 'error')
      resolve({ name, status: 'error', error: error.message })
    })

    request.on('timeout', () => {
      log(`${name} request timed out`, 'error')
      request.abort()
      resolve({ name, status: 'timeout' })
    })
  })
}

const checkApiEndpoints = async () => {
  const endpoints = [
    '/api/v1/users',
    '/api/v1/documents',
    '/api/v1/workspaces',
    '/api/v1/templates',
    '/api/v1/activities',
  ]

  const results = []

  for (const endpoint of endpoints) {
    const url = `${CONFIG.mockServerUrl}${endpoint}`
    try {
      const result = await checkUrl(url, `API ${endpoint}`)
      results.push(result)
    } catch (error) {
      results.push({
        name: `API ${endpoint}`,
        status: 'error',
        error: error.message,
      })
    }
  }

  return results
}

const checkDatabase = () => {
  try {
    if (!fs.existsSync(CONFIG.dbPath)) {
      log('Mock database file not found', 'error')
      return { status: 'error', message: 'Database file missing' }
    }

    const dbContent = fs.readFileSync(CONFIG.dbPath, 'utf8')
    const db = JSON.parse(dbContent)

    const requiredTables = [
      'users',
      'documents',
      'workspaces',
      'templates',
      'activities',
    ]
    const missingTables = requiredTables.filter(table => !db[table])

    if (missingTables.length > 0) {
      log(`Missing database tables: ${missingTables.join(', ')}`, 'warning')
      return {
        status: 'incomplete',
        message: `Missing tables: ${missingTables.join(', ')}`,
      }
    }

    const stats = {
      users: db.users?.length || 0,
      documents: db.documents?.length || 0,
      workspaces: db.workspaces?.length || 0,
      templates: db.templates?.length || 0,
      activities: db.activities?.length || 0,
    }

    log(`Database integrity check passed`, 'success')
    log(
      `Data counts: ${Object.entries(stats)
        .map(([k, v]) => `${k}:${v}`)
        .join(', ')}`,
      'info'
    )

    return { status: 'healthy', stats }
  } catch (error) {
    log(`Database check failed: ${error.message}`, 'error')
    return { status: 'error', error: error.message }
  }
}

const checkEnvironment = () => {
  const requiredEnvVars = []
  const optionalEnvVars = ['NODE_ENV', 'MODE', 'PORT', 'NEXT_PUBLIC_API_URL']

  const envStatus = {}

  // Check required environment variables
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      envStatus[varName] = { status: 'set', value: process.env[varName] }
    } else {
      envStatus[varName] = { status: 'missing' }
      log(`Required environment variable ${varName} is not set`, 'warning')
    }
  })

  // Check optional environment variables
  optionalEnvVars.forEach(varName => {
    if (process.env[varName]) {
      envStatus[varName] = { status: 'set', value: process.env[varName] }
    } else {
      envStatus[varName] = { status: 'default' }
    }
  })

  const missingRequired = requiredEnvVars.filter(
    varName => !process.env[varName]
  )

  if (missingRequired.length === 0) {
    log('Environment variables check passed', 'success')
    return { status: 'healthy', variables: envStatus }
  } else {
    log(
      `Missing required environment variables: ${missingRequired.join(', ')}`,
      'warning'
    )
    return { status: 'incomplete', missingRequired, variables: envStatus }
  }
}

const checkDependencies = () => {
  const packageJsonPath = path.join(__dirname, '../package.json')

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    const nodeModulesPath = path.join(__dirname, '../node_modules')

    if (!fs.existsSync(nodeModulesPath)) {
      log('Node modules not installed', 'error')
      return { status: 'error', message: 'Run npm install' }
    }

    const criticalDeps = [
      'next',
      'react',
      'react-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'json-server',
    ]

    const missingDeps = criticalDeps.filter(dep => {
      const depPath = path.join(nodeModulesPath, dep)
      return !fs.existsSync(depPath)
    })

    if (missingDeps.length > 0) {
      log(`Missing critical dependencies: ${missingDeps.join(', ')}`, 'error')
      return { status: 'incomplete', missingDeps }
    }

    log('Dependencies check passed', 'success')
    return {
      status: 'healthy',
      nodeVersion: process.version,
      packageManager: packageJson.packageManager || 'unknown',
    }
  } catch (error) {
    log(`Dependencies check failed: ${error.message}`, 'error')
    return { status: 'error', error: error.message }
  }
}

const generateReport = results => {
  const report = {
    timestamp: new Date().toISOString(),
    overall: 'healthy',
    checks: results,
  }

  // Determine overall health
  const hasErrors = results.some(r => r.status === 'error')
  const hasWarnings = results.some(
    r => r.status === 'incomplete' || r.status === 'unhealthy'
  )

  if (hasErrors) {
    report.overall = 'error'
  } else if (hasWarnings) {
    report.overall = 'warning'
  }

  // Generate summary
  const summary = {
    total: results.length,
    healthy: results.filter(r => r.status === 'healthy').length,
    warnings: results.filter(r =>
      ['incomplete', 'unhealthy', 'warning'].includes(r.status)
    ).length,
    errors: results.filter(r => r.status === 'error').length,
  }

  log('\\n=== HEALTH CHECK SUMMARY ===', 'info')
  log(
    `Overall Status: ${report.overall.toUpperCase()}`,
    report.overall === 'healthy' ? 'success' : 'warning'
  )
  log(
    `Checks: ${summary.healthy}/${summary.total} healthy, ${summary.warnings} warnings, ${summary.errors} errors`,
    'info'
  )

  if (report.overall === 'healthy') {
    log('\\n🎉 All systems are operational!', 'success')
    log('You can start development with: npm run dev:full', 'info')
  } else {
    log('\\n🔧 Some issues need attention:', 'warning')
    results
      .filter(r => r.status !== 'healthy')
      .forEach(result => {
        log(
          `- ${result.name}: ${result.message || result.error || result.status}`,
          'warning'
        )
      })
  }

  return report
}

const runHealthCheck = async () => {
  log('Starting health check...', 'info')

  const results = []

  // Check database
  log('\\n1. Checking mock database...', 'info')
  const dbResult = checkDatabase()
  results.push({ name: 'Mock Database', ...dbResult })

  // Check environment
  log('\\n2. Checking environment...', 'info')
  const envResult = checkEnvironment()
  results.push({ name: 'Environment', ...envResult })

  // Check dependencies
  log('\\n3. Checking dependencies...', 'info')
  const depResult = checkDependencies()
  results.push({ name: 'Dependencies', ...depResult })

  // Check mock server
  log('\\n4. Checking mock server...', 'info')
  const mockServerResult = await checkUrl(CONFIG.mockServerUrl, 'Mock Server')
  results.push(mockServerResult)

  // Check API endpoints (if mock server is running)
  if (mockServerResult.status === 'healthy') {
    log('\\n5. Checking API endpoints...', 'info')
    const apiResults = await checkApiEndpoints()
    results.push(...apiResults)
  } else {
    log(
      '\\n5. Skipping API endpoint checks (mock server not running)',
      'warning'
    )
    results.push({
      name: 'API Endpoints',
      status: 'skipped',
      message: 'Mock server not available',
    })
  }

  // Check Next.js server (optional)
  log('\\n6. Checking Next.js server (optional)...', 'info')
  const nextServerResult = await checkUrl(
    CONFIG.nextServerUrl,
    'Next.js Server'
  )
  if (
    nextServerResult.status === 'error' ||
    nextServerResult.status === 'timeout'
  ) {
    nextServerResult.status = 'optional'
    nextServerResult.message =
      "Not running (this is normal if you haven't started the dev server)"
  }
  results.push(nextServerResult)

  // Generate and display report
  const report = generateReport(results)

  // Write report to file
  const reportPath = path.join(__dirname, '../health-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  log(`\\nDetailed report saved to: ${reportPath}`, 'info')

  return report.overall === 'healthy' ? 0 : 1
}

// Run health check if called directly
if (require.main === module) {
  runHealthCheck()
    .then(exitCode => process.exit(exitCode))
    .catch(error => {
      log(`Health check failed: ${error.message}`, 'error')
      process.exit(1)
    })
}

module.exports = { runHealthCheck, checkUrl, checkDatabase }
