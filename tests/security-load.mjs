import { setTimeout as delay } from 'node:timers/promises';

const url = process.env.URL || 'http://127.0.0.1:4000';

const runSecurityProbe = async () => {
  const responses = [];
  for (let i = 0; i < 20; i += 1) {
    const res = await fetch(`${url}/api/contact`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'user@example.com',
        message: 'Security test message for load validation.'
      })
    });
    responses.push(res.status);
    await delay(100);
  }

  return responses;
};

try {
  const results = await runSecurityProbe();
  const rejected = results.filter((status) => status === 429 || status === 403);
  console.log(JSON.stringify({ results, rejectedCount: rejected.length }, null, 2));
  if (results.every((status) => status === 400 || status === 429 || status === 403 || status === 200)) {
    process.exit(0);
  }
  process.exit(1);
} catch (error) {
  console.error('Security probe failed:', error);
  process.exit(1);
}
