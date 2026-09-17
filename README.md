# Security Engineer Portfolio

A modern, security-first portfolio for a software engineer focused on cloud resilience, application defense, zero-trust architecture, and secure engineering operations.

## Stack
- Node.js
- TypeScript
- Express
- Helmet
- Express Rate Limit
- Nodemailer
- Vitest
- Playwright

## Features
- Dark cyber-defense design system
- Responsive layout for mobile, tablet, and desktop
- Secure contact form with validation and bot filtering
- Rate limiting and security headers
- Production-ready TypeScript build pipeline
- Automated unit tests and security probe checks

## Local development
1. Install Node.js and npm
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the app:
   ```bash
   npm run dev -- --port 4000
   ```
4. Open:
   ```text
   http://localhost:4000
   ```

## Production build
```bash
npm run build
npm start
```

## Security notes
- Do not commit secrets or environment files
- Store SMTP and email credentials in deployment secrets or server environment variables
- The repository intentionally ignores `.env` and build artifacts

## Deployment
This project is prepared for GitHub Pages deployment via the workflow in `.github/workflows/deploy-pages.yml`.

