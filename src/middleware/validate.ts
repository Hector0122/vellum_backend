import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';

function respondInvalid(res: Response, error: import('zod').ZodError) {
  const issue = error.issues[0];
  const field = issue?.path.join('.');
  res.status(400).json({
    error: field ? `${field}: ${issue.message}` : issue?.message || 'Invalid request',
  });
}

export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      respondInvalid(res, result.error);
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      respondInvalid(res, result.error);
      return;
    }
    (req as any).validatedQuery = result.data;
    next();
  };
}
