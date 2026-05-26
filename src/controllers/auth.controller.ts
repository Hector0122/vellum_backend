import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import type { AuthenticatedRequest } from '../types';

export async function signUp(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

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

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

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

export async function resetPassword(req: Request, res: Response) {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  try {
    await authService.resetPassword(email);
    res.json({ success: true });
  } catch (err: any) {
    const status = err.message.includes('No account') ? 404 : 500;
    res.status(status).json({ error: err.message });
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
