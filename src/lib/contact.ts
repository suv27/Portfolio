export type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
  company?: string;
};

export type BotSignal = {
  userAgent?: string;
  secFetchMode?: string;
  honeypot?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE_LEN = 2000;

export function validateContactPayload(payload: ContactPayload): ContactPayload {
  const name = (payload.name ?? '').trim();
  const email = (payload.email ?? '').trim().toLowerCase();
  const message = (payload.message ?? '').trim();
  const company = (payload.company ?? '').trim();

  if (!name || name.length < 2 || name.length > 120) {
    throw new Error('Name is required.');
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new Error('A valid email is required.');
  }

  if (!message || message.length < 10 || message.length > MAX_MESSAGE_LEN) {
    throw new Error('Message must be 10-2000 characters long.');
  }

  if (containsHtmlOrScript(message)) {
    throw new Error('Message contains unsupported content.');
  }

  if (containsHtmlOrScript(name) || containsHtmlOrScript(company)) {
    throw new Error('Input contains unsupported content.');
  }

  return {
    name,
    email,
    message,
    company
  };
}

export function isBotEvidence(signal: BotSignal): boolean {
  const userAgent = (signal.userAgent ?? '').toLowerCase();
  const secFetchMode = (signal.secFetchMode ?? '').toLowerCase();
  const honeypot = (signal.honeypot ?? '').toLowerCase();

  const botPatterns = ['bot', 'crawler', 'spider', 'slurp', 'bingpreview', 'googlebot'];
  const botDetected = botPatterns.some((pattern) => userAgent.includes(pattern));
  const fetchMissing = secFetchMode === '' || secFetchMode === 'navigate';

  return botDetected || fetchMissing || honeypot.length > 0;
}

function containsHtmlOrScript(value: string): boolean {
  return /<\s*(script|iframe|object|embed|svg|img|form|input)[\s\S]*?>/i.test(value) || /[<>]/.test(value);
}
