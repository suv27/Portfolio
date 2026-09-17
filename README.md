# Security Engineer Portfolio

A modern, security-first portfolio for a software engineer focused on cloud resilience, application defense, zero-trust architecture, and secure engineering operations.

## Live site
The portfolio is published to GitHub Pages at:

https://suv27.github.io/Portfolio/

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
- Security-focused landing page and story layout
- Static GitHub Pages deployment with relative asset paths
- Secure contact flow for full backend deployments
- Production-ready TypeScript build pipeline
- Automated unit tests and security probe checks

## Local development
1. Install Node.js and npm
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the app locally:
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

## GitHub Pages deployment notes
This repository is configured to work as a static site on GitHub Pages. The critical fix is that all asset URLs are relative, so the site works correctly under the repository subpath:

- `./styles.css`
- `./main.js`
- `./index.html`

This prevents broken styling when the site is served from `https://suv27.github.io/Portfolio/` instead of the root domain.

## Security notes
- Do not commit secrets or environment files
- Store SMTP and email credentials in deployment secrets or server environment variables
- The repository intentionally ignores `.env` and build artifacts
- The static GitHub Pages site uses a mailto fallback for the contact form so the page remains functional without a backend API

## Deployment
This project supports both:
- GitHub Pages for the static front-end presentation
- a full Express backend for local/prod environments with real contact handling

