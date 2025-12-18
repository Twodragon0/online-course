# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| 14.x    | :white_check_mark: |

## Reporting a Vulnerability

We take the security of our software seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Email**: Send a detailed report to `twodragon114@gmail.com`
   - Include a clear description of the vulnerability
   - Provide steps to reproduce the issue
   - Include any potential impact assessment
   - Attach any relevant proof-of-concept code (if applicable)

2. **GitHub Security Advisory**: Use GitHub's private vulnerability reporting feature if available

### What to Include

When reporting a vulnerability, please include:

- **Type of vulnerability** (e.g., XSS, SQL injection, authentication bypass)
- **Affected component** (e.g., API route, middleware, component)
- **Steps to reproduce** the vulnerability
- **Potential impact** and severity assessment
- **Suggested fix** (if you have one)
- **Proof of concept** (if applicable, but please be responsible)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: Depends on severity and complexity

### Security Best Practices

We follow these security best practices:

- ✅ Regular dependency updates
- ✅ Automated security scanning (Dependabot)
- ✅ Input validation and sanitization
- ✅ Rate limiting on all API routes
- ✅ Secure authentication (NextAuth.js)
- ✅ HTTPS enforcement in production
- ✅ Secure cookie settings
- ✅ Content Security Policy (CSP)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection

### Known Security Measures

Our application implements the following security measures:

1. **Authentication & Authorization**
   - NextAuth.js with Google OAuth
   - Secure session management
   - JWT tokens with proper expiration

2. **Input Validation**
   - All user inputs are validated and sanitized
   - Email format validation
   - Password strength requirements
   - File ID validation
   - Message length limits

3. **Rate Limiting**
   - IP-based rate limiting on all API routes
   - Different limits for different endpoints
   - Automatic cleanup of expired rate limit records

4. **API Security**
   - CORS protection
   - CSRF protection (NextAuth.js)
   - Webhook signature verification (Stripe)
   - Request timeout handling

5. **Data Protection**
   - Password hashing with bcrypt (12 rounds)
   - SQL injection prevention (Prisma parameterized queries)
   - XSS protection (input sanitization)
   - Secure environment variable handling

6. **Infrastructure Security**
   - HTTPS only in production
   - Secure headers (CSP, HSTS, X-Frame-Options)
   - Environment variable validation
   - Database connection validation

### Security Updates

We regularly update dependencies to address security vulnerabilities:

- **Automated**: Dependabot alerts for dependency vulnerabilities
- **Manual**: Regular security audits and updates
- **Emergency**: Critical security patches applied immediately

### Disclosure Policy

- We will acknowledge receipt of your vulnerability report
- We will work with you to understand and resolve the issue
- We will notify you when the vulnerability is fixed
- We will credit you in our security advisories (if you wish)

### Out of Scope

The following are considered out of scope for security reporting:

- Denial of Service (DoS) attacks that don't require authentication
- Social engineering attacks
- Physical security issues
- Issues requiring physical access to the device
- Issues in third-party services we use (please report directly to them)

### Security Contact

For security-related questions or concerns:

- **Email**: twodragon114@gmail.com
- **Response Time**: We aim to respond within 48 hours

---

**Thank you for helping keep our application secure!**




