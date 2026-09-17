import { describe, expect, it } from 'vitest';
import { validateContactPayload, isBotEvidence } from '../../src/lib/contact.js';

describe('contact validation', () => {
  it('accepts valid payloads', () => {
    const result = validateContactPayload({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'I would like to discuss a security architecture engagement.',
      company: 'The Analytical Engine'
    });

    expect(result.name).toBe('Ada Lovelace');
    expect(result.email).toBe('ada@example.com');
  });

  it('rejects empty or malicious payloads', () => {
    expect(() => validateContactPayload({ name: '', email: 'bad', message: '' })).toThrow();
    expect(() => validateContactPayload({ name: 'X', email: 'user@example.com', message: '<script>alert(1)</script>' })).toThrow();
  });

  it('detects bot-like evidence and a honeypot trigger', () => {
    expect(isBotEvidence({
      userAgent: 'Googlebot/2.1 (+http://www.google.com/bot.html)',
      secFetchMode: undefined,
      honeypot: 'present'
    })).toBe(true);
  });
});
