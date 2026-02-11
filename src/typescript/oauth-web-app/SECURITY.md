# 🔐 Security Policy

## Reporting Security Vulnerabilities

**⚠️ DO NOT** report security vulnerabilities as public GitHub issues.

If you discover a security vulnerability, please follow these steps:

### 1. Private Disclosure

- Email the security issue to the project maintainers
- Include a description of the vulnerability
- Provide steps to reproduce (if applicable)
- **Do NOT** include proof of concept code or exploits
- Allow time for the team to respond and patch

### 2. What to Include

```
Subject: Security Vulnerability Report - [Brief Description]

Body:
- Vulnerability Type: (e.g., XSS, SQL Injection, etc.)
- Location: (e.g., file path, component)
- Severity: (Critical/High/Medium/Low)
- Description: [Detailed explanation]
- Steps to Reproduce: [If applicable]
- Impact: [What could an attacker do?]
- Suggested Fix: [If you have one]
```

### 3. Response Timeline

- **Confirmation**: We'll confirm receipt within 48 hours
- **Assessment**: Security team will assess the vulnerability
- **Timeline**: We aim to patch critical issues within 5-7 days
- **Disclosure**: We'll coordinate public disclosure after a patch is released

## Security Best Practices

### For Users

1. **Keep Dependencies Updated**

   ```bash
   npm audit
   npm update
   ```

2. **Use Environment Variables for Secrets**
   - Never commit `.env.local` or secrets to Git
   - Use `.env.example` to document required variables

3. **Enable OAuth Securely**
   - Use HTTPS in production
   - Store client secrets securely
   - Validate redirect URIs

4. **Authentication & Authorization**
   - Use strong passwords
   - Implement rate limiting
   - Validate all user inputs

### For Developers

1. **Code Review Requirements**
   - All PRs require security review
   - Pay attention to:
     - Input validation
     - Authentication/authorization
     - Data exposure
     - Dependency vulnerabilities

2. **Dependency Management**

   ```bash
   # Regular audits
   npm audit
   npm audit fix

   # Check for outdated packages
   npm outdated
   ```

3. **Secure Coding Practices**
   - Sanitize user inputs
   - Use parameterized queries
   - Avoid hardcoding secrets
   - Validate and escape output

## Security Scanning

This project uses automated security tools:

### 1. CodeQL

- Automatic code analysis on every push
- Detects potential security issues
- Results visible in Security tab on GitHub

### 2. Dependency Auditing

- `npm audit` checks for known vulnerabilities
- Runs in CI/CD pipeline
- Fails build if critical issues found

### 3. Type Safety

- TypeScript with strict mode
- Catches potential runtime errors
- Type checking in CI pipeline

## Known Security Issues

None currently reported. If you're aware of any, please follow the reporting process above.

## Security Advisories

We follow the GitHub Security Advisory system. Check the [Security Advisories](https://github.com/[USER]/react-web-template/security/advisories) page for:

- Published security advisories
- GHSA (GitHub Security Advisory) identifiers
- CVE information

## Supported Versions

### Version Support

| Version | Status | Support Until |
| ------- | ------ | ------------- |
| 1.0.x   | ✅ LTS | Feb 2028      |

### Upgrade Path

Stay on the latest 1.0.x patch version for security fixes.

## Dependencies Security

### Regular Updates

- Dependencies checked weekly
- Critical updates applied immediately
- Regular updates applied monthly
- Deprecation warnings monitored

### Third-Party Libraries

We use the following libraries with good security track records:

- **Next.js** - Actively maintained, security updates prioritized
- **React** - Maintained by Meta, regular security reviews
- **Zustand** - Minimal dependencies, focused scope
- **Tailwind CSS** - Build-time only, no runtime security impact

## Contact

For security concerns, reach out to the project maintainers privately.

---

**Last Updated**: February 11, 2026

For more information, see [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
