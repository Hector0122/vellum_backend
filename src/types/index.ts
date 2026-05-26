import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface BookRecord {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  description: string | null;
  cover_url: string | null;
  file_url: string;
  file_type: 'epub' | 'pdf';
  progress_percent: number;
  progress_cfi: string | null;
  last_opened_at: string | null;
  created_at: string;
}

export interface HighlightRecord {
  id: string;
  user_id: string;
  book_id: string;
  text: string;
  location: string;
  color: string;
  created_at: string;
}

export interface NoteRecord {
  id: string;
  user_id: string;
  book_id: string;
  highlight_id: string | null;
  content: string;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: AuthTokens;
}
