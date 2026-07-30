import { createHmac, timingSafeEqual } from 'crypto';
import { env } from '../config/env';

const WINDOW_MS = 15 * 60 * 1000;

function codeForWindow(email: string, window: number): string {
  const data = `password-reset:${email.toLowerCase()}:${window}`;
  const hmac = createHmac('sha256', env.JWT_SECRET).update(data).digest('hex');
  const num = parseInt(hmac.slice(0, 8), 16) % 1_000_000;
  return num.toString().padStart(6, '0');
}

export function generateResetCode(email: string): string {
  const window = Math.floor(Date.now() / WINDOW_MS);
  return codeForWindow(email, window);
}

export function verifyResetCode(email: string, code: string): boolean {
  const currentWindow = Math.floor(Date.now() / WINDOW_MS);

  for (const window of [currentWindow, currentWindow - 1]) {
    const expected = codeForWindow(email, window);
    if (
      expected.length === code.length &&
      timingSafeEqual(Buffer.from(expected), Buffer.from(code))
    ) {
      return true;
    }
  }

  return false;
}
