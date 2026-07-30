const MAILGUN_API_BASE = 'https://api.mailgun.net/v3';

export async function sendPasswordResetEmail(
  toEmail: string,
  code: string,
): Promise<void> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.MAILGUN_FROM || `Vellum <no-reply@${domain}>`;

  if (!apiKey || !domain) {
    throw new Error('Mailgun is not configured (MAILGUN_API_KEY/MAILGUN_DOMAIN)');
  }

  const body = new URLSearchParams({
    from,
    to: toEmail,
    subject: 'Your Vellum password reset code',
    text: `Your password reset code is: ${code}\n\nThis code expires in 15 minutes. If you didn't request this, you can ignore this email.`,
  });

  const response = await fetch(`${MAILGUN_API_BASE}/${domain}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Mailgun API error: ${response.status} — ${err.slice(0, 200)}`);
  }
}
