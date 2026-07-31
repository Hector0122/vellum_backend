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
- [x] Filtros: All / Reading / Unread / Read
- [x] Sort: Recent, A—Z, Progress, Added
- [x] Long-press delete con confirmación
- [x] Pull-to-refresh
- [x] FAB para upload (abajo derecha)
- [x] Progress bar con texto de porcentaje (ej: "34%")
- [x] Badge "leído" en libros terminados
- [x] Géneros visibles en cada libro (extraídos por IA, catálogo controlado)

### Reader
- [x] EpubReader (WebView + epubjs 0.3.93 + JSZip + PanGestureHandler)
- [x] Proxy GET /api/books/:id/file?token= (stream desde R2)
- [x] Progress persistence (CFI guardado/restaurado)
- [x] Overlay rediseñado como panel inferior (tap backdrop para cerrar)
- [x] Overlay toggle: detección táctil en iframes + debounce (sin GestureDetector)
- [x] SafeAreaView + safe zone handling
- [x] Cache local de EPUBs (Documents/epub_cache/)
- [x] Font customization (size +/- y family: System/Serif/Sans/Mono)
- [x] Navegación por capítulos (TOC aplanado con indentación)
- [x] Bookmarks: backend CRUD + frontend store + goToCfi

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

### Bookmarks
- [x] Prisma model Bookmark (id, user_id, book_id, cfi, label, created_at)
- [x] CRUD service + controller → /api/books/:bookId/bookmarks
- [x] bookmarkStore (Zustand) + goToCfi en EpubReader
- [x] Add (botón + en overlay) y navegar (tap) / eliminar (long-press)

### Backend Infrastructure (26 de Mayo 2026)
- [x] Express + TypeScript
- [x] Prisma (PostgreSQL en Supabase)
- [x] Cloudflare R2 (presigned uploads)
- [x] CORS configurado
- [x] Rate limiting (auth, api, upload, password reset) — apiLimiter 600 req/15min
- [x] Zod validation schemas
- [x] Search endpoint (GET /api/books/search?q=)
- [x] Paginación en todos los listados
- [x] PATCH endpoints para highlights y notas
- [x] Reset password & edit profile endpoints
- [x] trust proxy = 1 (fix ERR_ERL_PERMISSIVE_TRUST_PROXY para Railway)
- [x] start script: prisma db push (reemplaza migrate deploy)
- [x] Bookmarks CRUD (modelo Prisma + service + controller + routes)
- [x] AI helper compartido `src/lib/ai.ts` (callGroq + callGemini, reutilizado por summaries y recommendations)
- [x] Recommendations service + controller + routes (`/api/recommendations/*`)
- [x] Auto-marca `status='read'` al llegar progress_percent >= 100

### Recomendaciones IA (Descubrir)
- [x] Modelo Prisma `BookSuggestion` (userId, title, author, synopsis, reason, genres, sourceBooks, status, expiresAt)
- [x] Catálogo controlado de géneros (15 géneros normalizados: Ficción, Terror, Suspenso, Romance, Fantasía, Ciencia Ficción, Historia, Filosofía, Biografía, Negocios, Autoayuda, Ciencia, Arte, Humor, Aventura)
- [x] Extracción automática de géneros por IA (Groq → Gemini fallback, cache en Book.genres)
- [x] Generación de recomendaciones basada en libros leídos (análisis de todo el historial, no solo el último)
- [x] 2-3 recomendaciones máximo, TTL 24 horas
- [x] Backend: POST /api/recommendations/generate, GET /api/recommendations, GET /api/recommendations/wishlist, PATCH /api/recommendations/:id
- [x] Botón "Descubrir" en header de Library (icono brújula)
- [x] Pantalla DiscoverScreen (título, autor, géneros, sinopsis, razón de recomendación)
- [x] Botón "Quiero leer" / "Descartar" en cada sugerencia
- [x] Pantalla WishlistScreen (lista de libros guardados para leer)
- [x] Icono "bookmark-multiple" en header para acceso rápido a wishlist

### Navegación
- [x] Auth stack (SignIn, SignUp, ForgotPassword)
- [x] Library (única pantalla principal, sin tabs)
- [x] HighlightsScreen (accesible desde ícono en header)
- [x] DiscoverScreen (accesible desde ícono brújula en header)
- [x] WishlistScreen (accesible desde ícono bookmark en header)
- [x] Reader (slide from bottom)
- [x] Profile modal

### Frontend Stack
- [x] React Native 0.85.3 (Fabric)
- [x] React Navigation (native stack, sin tabs)
- [x] SafeAreaProvider + react-native-config
- [x] Font customization (AsyncStorage persistido)
- [x] EPUB cache local (Documents/epub_cache/)
- [x] CSS self-closing-comp warning fix
- [x] Theme centralizado: `src/shared/theme/colors.ts` (paleta minimalista clara, fondo `#F8F5EF`)
- [x] Colores refactorizados en los 16 archivos del proyecto (acento `#6C63FF`, fondo `#0D0D14`)

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
- [x] Toast notifications pulidas (react-native-toast-message con fondos sólidos opacos, 3 variantes: success/error/info)

#### Fase 5: AI & Widget ✅

##### Widget Android ✅
- [x] Endpoint backend `GET /api/widget/book/:bookId` (libro + highlights + bookmarks)
- [x] Endpoint backend `GET /api/widget/bookmarked-books`
- [x] AppWidgetProvider nativo (VellumWidgetProvider.kt)
- [x] Layout del widget: título, highlight, dots indicadores
- [x] Carrusel automático (AlarmManager, rota cada 5s entre highlights)
- [x] Deep link `vellum://reader/:bookId` → abre reader desde el widget
- [x] Módulo nativo RN (VellumWidgetModule)
- [x] WidgetConfigScreen (seleccionar libro, aplicar al widget)
- [x] Icono de acceso en header de Library (widget-outline)

##### Warm Paper 🌿 ❌
- [x] ~~Modo de lectura "papel cálido": fondo sepia/warm + texto oscuro~~ — **Removido. Fondo #F5ECD7 por defecto.**

##### Reading Stats 📊 🔄
- [x] Modelo Prisma `ReadingSession` (userId, bookId, startedAt, endedAt, durationSeconds, wordsRead)
- [x] POST /api/stats/session → crea sesión al abrir reader
- [x] PATCH /api/stats/session/:id → finaliza sesión (descarta si <5 min)
- [x] GET /api/stats/streak → currentStreak, todayMinutes, totalMinutes
- [x] Flame icon 🔥 animado en header de Library (scale bounce cuando sube racha)
- [x] Tracking automático de sesiones en ReaderScreen (inicio al montar, fin al desmontar)
##### Tiempo Restante ⏱️ 🔄
- [x] Mostrar tiempo estimado para terminar el capítulo actual (badge en reader, calculado en frontend)
- [x] WPM adaptativo: se aprende de la velocidad real de lectura por capítulo (running avg 70/30)
- [x] Mostrar tiempo estimado para terminar el libro completo (proyectado desde avg palabras por capítulo + total chapters)
- [x] Badge compacto: `~5m in chap · ~2h 15m total`

##### AI Summaries 🤖 ✅ (reconstruida tras la migración a react-native-readium)
- [x] Modelo Prisma `ChapterSummary` (bookId + chapterIndex único, cache en DB)
- [x] Backend proxy: Groq (`openai/gpt-oss-20b`) como primario, Gemini 2.0 Flash como fallback
- [x] Fallback automático: si Groq falla → Gemini automáticamente (si ambos fallan → error amigable)
- [x] Resumen generado en el mismo idioma del capítulo (ya no fuerza inglés)
- [x] Botón "AI Summary" en overlay del reader (verde `colors.success`, ícono `auto-fix`), en su propia fila para no competir por espacio con Save/Chapters/Bookmarks/Highlights
- [x] Extracción de texto del capítulo server-side vía `epub-parser` (`src/lib/epub.ts`), reutilizando la descarga de R2 — reemplaza el viejo `getChapterText()` de WebView, que ya no existe con el reader nativo
- [x] Páginas con muy poco texto (portada/título) devuelven error claro en vez de un resumen vacío cacheado para siempre
- [x] Panel inferior con resumen en 3-5 bullet points, scrollable (ScrollView con maxHeight fijo — ojo: `flex:1` en un ScrollView dentro de un panel con solo `maxHeight` colapsa a 0 en RN/Yoga, ya lo pisamos una vez)
- [x] Caché automático por capítulo en DB


---

## 🐛 Bugs conocidos

*Sin bugs activos conocidos.*

### Resueltos recientemente
- **Android: tap colisiona con selección de texto** — Resuelto con doble-tap (`Gesture.Tap().numberOfTaps(2)`) para abrir el overlay. El tap simple dentro del iframe solo dispara `tapped` cuando no hay selección activa, y el filtro `text.length >= 9` evita selecciones accidentales del system context menu.

---

## Release Build (Android)
- [x] Keystore generado (vellum-release.keystore, alias `vellum`)
- [x] APK release generado (`./gradlew assembleRelease`)
- [x] Instalado en dispositivo vía ADB

---

## Stack

```
Frontend:  React Native 0.85 + TypeScript + Zustand + React Navigation
Backend:   Express + TypeScript + Prisma + PostgreSQL (Supabase)
Storage:   Cloudflare R2 (presigned URLs)
Hosting:   Railway
```
