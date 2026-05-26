# Vellum Backend — Estado del proyecto

## Configuración

- [x] Express + TypeScript + tsx
- [x] Prisma (PostgreSQL vía DATABASE_URL)
- [x] Auth propio (bcrypt + JWT) — sin Supabase
- [x] Variables de entorno validadas
- [x] .gitignore
- [ ] Rate limiting (express-rate-limit instalado, no configurado)
- [ ] Validación de inputs (Zod)

## Auth

- [x] POST /api/auth/signup
- [x] POST /api/auth/signin
- [x] POST /api/auth/signout
- [x] GET /api/auth/me
- [ ] POST /api/auth/reset-password (pendiente)
- [ ] PATCH /api/auth/me (editar perfil)

## Books

- [x] GET /api/books
- [x] POST /api/books
- [x] GET /api/books/:id
- [x] PATCH /api/books/:id
- [x] DELETE /api/books/:id
- [x] POST /api/upload (presigned URL para R2)
- [ ] Paginación en listado

## Highlights

- [x] GET /api/books/:bookId/highlights
- [x] POST /api/books/:bookId/highlights
- [x] DELETE /api/books/:bookId/highlights/:highlightId
- [ ] PATCH /api/books/:bookId/highlights/:highlightId

## Notes

- [x] GET /api/books/:bookId/notes
- [x] POST /api/books/:bookId/notes
- [x] DELETE /api/books/:bookId/notes/:noteId
- [ ] PATCH /api/books/:bookId/notes/:noteId

## Search

- [ ] GET /api/books/search?q=

## File Upload (R2)

- [x] Instalar @aws-sdk/client-s3 + s3-request-presigner
- [x] Config R2 en .env
- [x] Servicio R2 (src/lib/r2.ts)
- [x] POST /api/upload — genera presigned upload URL

## Por hacer

- [ ] Rate limiting en app.ts
- [ ] Zod schemas para validación
- [ ] Paginación en list endpoints
- [ ] Endpoints faltantes (PATCH highlights/notes, edit profile, reset password, search)
