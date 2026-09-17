import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import { isBotEvidence, validateContactPayload } from './lib/contact.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

const contactLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many contact requests. Please wait a minute and try again.' },
  skipSuccessfulRequests: true
});

app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: []
      }
    }
  })
);

app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(publicDir, { index: false, maxAge: '1h' }));

app.get('/', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/contact', contactLimit, async (req, res) => {
  try {
    const payload = validateContactPayload(req.body ?? {});

    const userAgent = String(req.headers['user-agent'] ?? '');
    const secFetchMode = String(req.headers['sec-fetch-mode'] ?? '');
    const honeypot = String(req.body?.website ?? '');

    if (isBotEvidence({ userAgent, secFetchMode, honeypot })) {
      return res.status(403).json({ error: 'Request rejected as suspicious.' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: payload.email,
      subject: `Portfolio enquiry from ${payload.name}`,
      text: `Name: ${payload.name}\nEmail: ${payload.email}\nCompany: ${payload.company ?? 'N/A'}\nMessage:\n${payload.message}`
    });

    return res.status(200).json({ ok: true, message: 'Message sent securely.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to process request.';
    return res.status(400).json({ error: message });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Portfolio server listening on http://localhost:${port}`);
  });
}

export { app };
