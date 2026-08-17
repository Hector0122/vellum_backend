import { z } from 'zod';

// Auth Schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Code must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const editProfileSchema = z.object({
  displayName: z.string().optional(),
  avatarUrl: z.string().url('Invalid URL').optional(),
});

// Books Schemas
export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().optional(),
  description: z.string().optional(),
  cover_url: z.string().url('Invalid cover URL').optional().or(z.literal(null)),
  file_url: z.string().url('Invalid file URL'),
  file_type: z.enum(['epub', 'pdf', 'md']),
});

export const updateBookSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional().or(z.literal(null)),
  description: z.string().optional().or(z.literal(null)),
  cover_url: z.string().url('Invalid cover URL').optional().or(z.literal(null)),
  status: z.enum(['unread', 'reading', 'read']).optional(),
  progress_percent: z.number().min(0).max(100).optional(),
  progress_locator: z.string().optional().or(z.literal(null)),
  current_page: z.number().int().min(0).optional(),
  total_pages: z.number().int().min(1).optional().or(z.literal(null)),
  last_opened_at: z.string().datetime().optional(),
});

export const searchBooksSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  offset: z.coerce.number().min(0).default(0).optional(),
});

// Highlights Schemas
export const createHighlightSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  locator: z.string().min(1, 'Locator is required'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').default('#FFD700'),
});

export const updateHighlightSchema = z.object({
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
});

// Notes Schemas
export const createNoteSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  highlight_id: z.string().uuid().optional().or(z.literal(null)),
});

export const updateNoteSchema = z.object({
  content: z.string().min(1, 'Content is required').optional(),
  highlight_id: z.string().uuid().optional().or(z.literal(null)),
});

// Summaries Schemas
export const summarizeChapterSchema = z.object({
  href: z.string().min(1, 'href is required'),
});

// Bookmarks Schemas
export const createBookmarkSchema = z.object({
  locator: z.string().min(1, 'locator is required'),
  label: z.string().optional().or(z.literal(null)),
});

// Pagination Helper
export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  offset: z.coerce.number().min(0).default(0).optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type EditProfileInput = z.infer<typeof editProfileSchema>;
export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type SearchBooksInput = z.infer<typeof searchBooksSchema>;
export type CreateHighlightInput = z.infer<typeof createHighlightSchema>;
export type UpdateHighlightInput = z.infer<typeof updateHighlightSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;
