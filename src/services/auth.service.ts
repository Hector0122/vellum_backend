import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/db';
import { env } from '../config/env';
import type { UserProfile, AuthResponse } from '../types';

const SALT_ROUNDS = 10;

function generateToken(userId: string, email: string): string {
  return jwt.sign({ sub: userId, email }, env.JWT_SECRET, { expiresIn: '7d' });
}

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  const existing = await prisma.profile.findUnique({ where: { email } });
  if (existing) {
    throw new Error('A user with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const profile = await prisma.profile.create({
    data: {
      email,
      passwordHash,
      displayName: email.split('@')[0],
    },
  });

  const token = generateToken(profile.id, profile.email);

  return {
    user: mapProfile(profile),
    tokens: {
      access_token: token,
      refresh_token: token,
      expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
    },
  };
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const profile = await prisma.profile.findUnique({ where: { email } });
  if (!profile || !profile.passwordHash) {
    throw new Error('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, profile.passwordHash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(profile.id, profile.email);

  return {
    user: mapProfile(profile),
    tokens: {
      access_token: token,
      refresh_token: token,
      expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
    },
  };
}

export async function signOut(_accessToken: string): Promise<void> {
  // stateless JWT — nothing to invalidate
}

export async function resetPassword(_email: string): Promise<void> {
  throw new Error('Password reset is not available yet');
}

export async function getProfile(userId: string): Promise<UserProfile> {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!profile) {
    throw new Error('Profile not found');
  }

  return mapProfile(profile);
}

function mapProfile(p: any): UserProfile {
  return {
    id: p.id,
    email: p.email,
    display_name: p.displayName,
    avatar_url: p.avatarUrl,
    created_at: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
  };
}
