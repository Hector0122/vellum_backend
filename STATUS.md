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
- [x] Progress bar con texto de porcentaje (ej: "34%")

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
- [x] Theme centralizado: `src/shared/theme/colors.ts` (paleta minimalista oscura)
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
- [x] Toast notifications pulidas (react-native-toast-message con tema oscuro, 3 variantes: success/error/info)

#### Fase 5: AI & Widget (en progreso)

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

##### Warm Paper 🌿
- [ ] Modo de lectura "papel cálido": fondo sepia/warm + texto oscuro, reduce fatiga visual
- [ ] Toggle en el reader overlay (junto a font family/size)
- [ ] Persistir preferencia en AsyncStorage

##### Reading Stats 📊
- [ ] Dashboard de estadísticas de lectura (nueva pantalla o sección)
- [ ] Total de libros leídos / en progreso
- [ ] Rachas de lectura (días consecutivos leyendo)
- [ ] Tiempo total de lectura acumulado
- [ ] Gráfico semanal con minutos leídos por día
- [ ] Endpoint backend `GET /api/stats` (agregado de sesiones de lectura)

##### Tiempo Restante ⏱️
- [ ] Mostrar tiempo estimado para terminar el capítulo actual
- [ ] Mostrar tiempo estimado para terminar el libro
- [ ] Cálculo basado en velocidad de lectura (palabras por minuto)
- [ ] Barra o badge en el reader que diga "~12 min left in chapter"
- [ ] Endpoint backend `GET /api/books/:id/reading-estimate`

##### AI Summaries 🤖
- [ ] Botón "Resumir capítulo" que envía el texto del capítulo a una API (GPT/Claude)
- [ ] Devuelve 3-5 líneas de resumen; se guarda asociado al capítulo/libro
- [ ] Endpoint backend `/api/books/:id/chapter/:chapterIndex/summary` (proxy a LLM + caché)


---

## 🐛 Bugs conocidos

### Android: tap colisiona con selección de texto  
- **Síntoma**: Al hacer tap rápido en el reader, Android WebView auto-selecciona una palabra y muestra el menú del sistema ("copy, share, select all, websearch, read aloud"). Esto dispara simultáneamente el `selected` de epubjs (color picker) y el `Gesture.Tap` nativo (overlay/footer).  
- **Intentos fallidos**: filtro por duración del toque (JS y nativo), filtro por longitud de texto (>3 chars), remover GestureDetector, detección táctil JS dentro de iframes.  
- **Causa raíz**: Android system context menu en WebView selecciona texto automáticamente al hacer tap en contenido — no es comportamiento de epubjs, es del sistema.  
- **Posibles soluciones a explorar**:  
  - Doble-tap para abrir el footer `Gesture.Tap().numberOfTaps(2)`  
  - Botón flotante persistente tipo `Aa` (evita depender de gestos)  
  - `user-select: none` CSS en el iframe, habilitar solo vía long-press  
  - Usar `onTouchEnd` del WebView en vez de GestureDetector

---

## Release Build (Android)
- [x] Keystore generado (vellum-release.keystore, alias `vellum`)
- [x] APK release (ejecutar manual: `./gradlew assembleRelease`)

---

## Stack

```
Frontend:  React Native 0.85 + TypeScript + Zustand + React Navigation
Backend:   Express + TypeScript + Prisma + PostgreSQL (Supabase)
Storage:   Cloudflare R2 (presigned URLs)
Hosting:   Railway
```
