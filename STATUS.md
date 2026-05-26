# Vellum — Estado del proyecto

## ✅ Completado

### Auth
- [x] Sign up, sign in, sign out (bcrypt + JWT)
- [x] GET /api/auth/me
- [x] Screen: SignIn, SignUp, ForgotPassword
- [x] Profile modal (icono en header)
- [x] JWT en AsyncStorage + api client

### Library
- [x] CRUD libros (GET, POST, PATCH, DELETE)
- [x] LibraryScreen como pantalla única (sin tabs)
- [x] Upload EPUB → presigned URL → R2 → create book
- [x] Extracción automática de cover
- [x] Search bar local (título/autor)
- [x] Filtros: All / Reading / Unread
- [x] Sort: Recent, A—Z, Progress, Added
- [x] Long-press delete con confirmación
- [x] Pull-to-refresh
- [x] FAB para upload (abajo derecha)

### Reader
- [x] EpubReader (WebView + epubjs 0.3.93 + JSZip + PanGestureHandler)
- [x] Proxy GET /api/books/:id/file?token= (stream desde R2)
- [x] Progress persistence (CFI guardado/restaurado)
- [x] Overlay toggle (tap para mostrar/ocultar)
- [x] SafeAreaView + safe zone handling

### Highlights
- [x] CRUD (GET, POST, DELETE) en backend
- [x] GET /api/highlights (todos los highlights del user con book_title)
- [x] Seleccionar texto → aparece color picker
- [x] 5 colores: Yellow, Green, Blue, Pink, Orange
- [x] Rendering visual vía epub.js annotations
- [x] Highlights list dentro del reader (long-press delete)
- [x] HighlightsScreen global (agrupado por libro, tap abre reader)
- [x] Highlight store en Zustand
- [x] Botón en Library header → HighlightsScreen

### Navegación
- [x] Auth stack (SignIn, SignUp, ForgotPassword)
- [x] Library (única pantalla principal, sin tabs)
- [x] HighlightsScreen (accesible desde ícono en header)
- [x] Reader (slide from bottom)
- [x] Profile modal
- [x] Express + TypeScript
- [x] Prisma (PostgreSQL en Supabase)
- [x] Cloudflare R2 (presigned uploads)
- [x] CORS configurado
- [x] React Native 0.85.3 (Fabric)
- [x] React Navigation (native stack, sin tabs)
- [x] SafeAreaProvider + react-native-config

## 🔄 En progreso / Pendiente

| Prioridad | Item | Tipo |
|-----------|------|------|
| Alta | **Deploy backend a Railway** (CFI + highlight endpoints) | Infra |
| Alta | **Notes UI** (vincular a highlights, CRUD frontend) | Frontend |
| Media | Search endpoint `GET /api/books/search?q=` | Backend |
| Media | Rate limiting (ya instalado) | Backend |
| Baja | Zod validation | Backend |
| Baja | PATCH highlights/notes | Backend |
| Baja | Paginación en listados | Backend |
| Baja | Reset password / edit profile | Backend |

## Stack

```
Frontend:  React Native 0.85 + TypeScript + Zustand + React Navigation
Backend:   Express + TypeScript + Prisma + PostgreSQL (Supabase)
Storage:   Cloudflare R2 (presigned URLs)
Hosting:   Railway
```
