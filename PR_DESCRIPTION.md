## Summary
This PR completely redesigns the portfolio into a modern security engineering brand experience while upgrading the stack from legacy EJS/Node patterns to a TypeScript-first Express architecture.

## What’s included
- Modern, cyber-defense-inspired dark UI with high-contrast design language and security-themed branding
- Responsive layout optimized for mobile, tablet, and desktop browsers
- Secure contact form handling with validation, rate limiting, bot detection, honeypot checks, and hardened headers
- TypeScript app structure with reusable validation logic and testable route/unit coverage
- Updated build and start scripts for a more maintainable developer workflow

## Key technical improvements
- Migrated away from legacy EJS rendering toward a TypeScript server and static asset pipeline
- Added security middleware: Helmet, strict CSP, request rate limiting, and input sanitization
- Implemented contact payload validation for name, email, and message length/content checks
- Added bot and abuse detection heuristics for suspicious traffic patterns
- Hardened static asset delivery and response handling for safer runtime behavior

## Mobile compatibility improvements
- Added responsive breakpoints for narrow screens and stacked layouts on mobile devices
- Improved nav, hero content, cards, and form layout for smaller viewports
- Used progressive JavaScript fallbacks so the contact form works in broader browser compatibility scenarios
- Added CSS safeguards that degrade gracefully in browsers without full blur/filter support

## Security posture
- Protection against application-layer abuse through rate-limited form submissions
- Rejection of malformed or malicious payloads before mail processing
- Honeypot field to reduce bot-driven spam submissions
- Security headers configured to reduce common OWASP-style issues

## Testing coverage
- Unit tests for contact validation and route behavior
- Security probe script for abusive traffic scenarios
- TypeScript build validation to ensure production compatibility

## Notes
This is a substantial architecture and UX update intended to reposition the portfolio as a security engineering identity while preparing the app for more production-ready deployment patterns.
