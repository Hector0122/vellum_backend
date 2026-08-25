<p align="center"><img src=".github/logo/vellum-icon.png" width="80" alt="Vellum" /></p>

# Vellum — Backend

API para Vellum, una app móvil de lectura (EPUB, notas, IA). Capturas y descripción completa: **[vellum_frontend](https://github.com/Hector0122/vellum_frontend)**.

## Stack

| | |
|---|---|
| Framework | Express + TypeScript |
| ORM / DB | Prisma + PostgreSQL (Supabase) |
| Storage | Cloudflare R2 (S3-compatible) |
| IA | Groq (primario) · Gemini 2.0 Flash (fallback) |
| Email | Mailgun |

Desplegado en Railway.

## Arquitectura

- **Auth** — propio (bcrypt + JWT), independiente de Supabase Auth aunque la DB vive ahí
- **Books** — metadata, flujo de subida vía URL prefirmada a R2, extracción de portada
- **Highlights / Notes / Bookmarks** — anotaciones por libro
- **Summaries** — resúmenes de capítulo con IA, cacheados
- **Recommendations** — motor de "Discover" basado en géneros de libros leídos

## Cómo está resuelto

- Los archivos **nunca son públicos** — la subida es un PUT prefirmado directo a R2, y la descarga siempre pasa por un proxy/stream del backend, nunca una URL directa del bucket.
- **Groq como IA primaria, Gemini 2.0 Flash como fallback automático** — mismo patrón tanto para resúmenes de capítulo como para recomendaciones de libros.
- El extractor de texto de EPUB corre bajo un **lock** — la librería que lo hace guarda su estado de descompresión en variables compartidas, así que llamadas concurrentes sin ese lock terminarían leyendo el libro equivocado.
- Tras migrar el lector de `epub.js` a un toolkit nativo, **datos de ubicación viejos y nuevos conviven en el mismo campo** — un único parser central detecta el formato y nunca truena con una fila creada antes de la migración.

## Licencia

MIT — ver [LICENSE](LICENSE)
