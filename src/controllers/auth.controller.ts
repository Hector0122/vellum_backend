import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import type { AuthenticatedRequest } from '../types';

export async function signUp(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const result = await authService.signUp(email, password);
    res.status(201).json(result);
  } catch (err: any) {
    const status = err.message.includes('already exists') ? 409 : 500;
    res.status(status).json({ error: err.message });
  }
}

export async function signIn(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const result = await authService.signIn(email, password);
    res.json(result);
  } catch (err: any) {
    const status = err.message.includes('Invalid') ? 401 : 500;
    res.status(status).json({ error: err.message });
  }
}

export async function signOut(req: AuthenticatedRequest, res: Response) {
  const header = req.headers.authorization;
  const token = header?.slice(7);

  if (!token) {
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }

  try {
    await authService.signOut(token);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;

  try {
    await authService.requestPasswordReset(email);
  } catch (err: any) {
    // Swallow errors (e.g. Mailgun failures) — don't leak details, don't reveal
    // whether the email exists. Log server-side for debugging.
    console.error('[forgotPassword]', err.message);
  }

  res.json({
    success: true,
    message: 'If an account exists for this email, a reset code has been sent.',
  });
}

export async function resetPassword(req: Request, res: Response) {
  const { email, code, newPassword } = req.body;

  try {
    await authService.resetPassword(email, code, newPassword);
    res.json({ success: true });
  } catch (err: any) {
    let status = 500;
    if (err.message.includes('No account')) status = 404;
    else if (err.message.includes('Invalid or expired')) status = 401;
    res.status(status).json({ error: err.message });
  }
}

export async function editProfile(req: AuthenticatedRequest, res: Response) {
  const { displayName, avatarUrl } = req.body;

  try {
    const profile = await authService.editProfile(req.userId!, {
      displayName,
      avatarUrl,
    });
    res.json({ user: profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function me(req: AuthenticatedRequest, res: Response) {
  try {
    const profile = await authService.getProfile(req.userId!);
    res.json({ user: profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
