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
- [x] Cache local de EPUBs (Documents/epub_cache/)
- [x] Font customization (size +/- y family: System/Serif/Sans/Mono)

### Highlights
- [x] CRUD (GET, POST, DELETE) en backend
- [x] GET /api/highlights (todos los highlights del user con book_title)
- [x] Seleccionar texto → aparece color picker
- [x] 5 colores: Yellow, Green, Blue, Pink, Orange
- [x] Rendering visual vía epub.js annotations
- [x] Highlights list dentro del reader (expand para notes, long-press delete)
- [x] HighlightsScreen global (agrupado por libro, tap abre reader)

### Notes
- [x] CRUD (GET, POST, DELETE) en backend
- [x] GET /api/notes (todos los notes del user con book_title)
- [x] Notas vinculadas a highlights (highlight_id)
- [x] Tap en highlight → expande para ver/escribir notas
- [x] Notes en ReaderScreen y HighlightsScreen
- [x] Note store en Zustand

### Backend Infrastructure (26 de Mayo 2026)
- [x] Express + TypeScript
- [x] Prisma (PostgreSQL en Supabase)
- [x] Cloudflare R2 (presigned uploads)
- [x] CORS configurado
- [x] Rate limiting (auth, api, upload, password reset)
- [x] Zod validation schemas
- [x] Search endpoint (GET /api/books/search?q=)
- [x] Paginación en todos los listados
- [x] PATCH endpoints para highlights y notes
- [x] Reset password & edit profile endpoints

### Navegación
- [x] Auth stack (SignIn, SignUp, ForgotPassword)
- [x] Library (única pantalla principal, sin tabs)
- [x] HighlightsScreen (accesible desde ícono en header)
- [x] Reader (slide from bottom)
- [x] Profile modal

### Frontend Stack
- [x] React Native 0.85.3 (Fabric)
- [x] React Navigation (native stack, sin tabs)
- [x] SafeAreaProvider + react-native-config
- [x] Font customization (AsyncStorage persistido)
- [x] EPUB cache local (Documents/epub_cache/)
- [x] CSS self-closing-comp warning fix

### Animaciones
- [x] react-native-reanimated v4.3.1
- [x] FAB con spring animation (AnimatedFAB)
- [x] Fade-in/fade-out en highlights y notes (FadeInDown.springify)
- [x] Color picker animado (FadeIn.springify)
- [x] Profile modal (slide nativo)
- [x] Transición Library → Reader (slide_from_bottom nativo)
- [x] Swipe gesture en Reader (PanGestureHandler + Reanimated)

---

## 🔄 En Progreso

### Performance & Polish (Roadmap)

#### Fase 2: Lazy Loading & Optimizaciones ✅
- [x] Lazy load de portadas (FlatList: initialNumToRender, maxToRenderPerBatch, windowSize, removeClippedSubviews)
- [x] Infinite scroll en listas (highlights con onEndReached + paginación en stores)
- [x] Memo() en componentes pesados (BookCard, HighlightItem como React.memo)
- [x] useMemo para cálculos costosos (search, filters, groupings)
- [x] useCallback para event handlers (LibraryScreen, HighlightsScreen, ReaderScreen)
- [x] Image caching optimization (CachedImage component + imageCache utility con react-native-blob-util)

#### Fase 3: Analytics & Pulidos ✅
- [x] Integrar event tracking básico (analytics service + backend endpoint POST /api/analytics/track)
- [x] Track: page views, book opens, highlights created, notes, font changes, deletes
- [x] Performance monitoring (render times via console en analytics service)
- [x] Haptic feedback en interacciones clave (Vibration: light/medium/heavy/success/error)
- [x] Toast notifications pulidas (react-native-toast-message con tema oscuro, 3 variantes: success/error/info)

#### Fase 4: Advanced Sync (futuro, multi-dispositivo)
- [ ] Arquitectura local-first (SQLite / WatermelonDB)
- [ ] Queue de cambios offline (retry con exponential backoff)
- [ ] Sincronización en background (periodic fetch / push notifications)
- [ ] Conflict resolution (last-write-wins o field-level merge)
- [ ] Detección de cambios multi-device (updated_at + cursor-based sync)


## Stack

```
Frontend:  React Native 0.85 + TypeScript + Zustand + React Navigation
Backend:   Express + TypeScript + Prisma + PostgreSQL (Supabase)
Storage:   Cloudflare R2 (presigned URLs)
Hosting:   Railway
```
