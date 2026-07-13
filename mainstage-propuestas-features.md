# MainStage — Propuestas de Features Diferenciales

Contexto: proyecto académico (diplomado full stack) de venta de boletos para eventos y conciertos en Colombia. Stack: Node.js + Express + TypeScript + Prisma + PostgreSQL (backend) / React + Vite + TypeScript + Redux Toolkit (frontend).

Estas propuestas nacen de comparar problemas reales y documentados de boleteras grandes (Ticketmaster, Viagogo, TuBoleta) en 2026: comisiones ocultas, precios dinámicos opacos, entradas especulativas/reventa fantasma, falta de control de acceso por fases de venta, y dependencia de múltiples plataformas sin un punto único de descubrimiento. Se descartó todo lo que dependiera de infraestructura pesada (saturación de servidores, colas masivas, CDN), dejando solo lo viable con el stack actual.

---

## Estado de implementación (fase 1 — completada)

| # | Feature | Estado | Commit |
|---|---------|--------|--------|
| 1 | Transparencia total de precio | ✅ Implementado | `0657a2e` |
| 2 | Límite de compra por usuario/evento | ✅ Implementado | `0657a2e` |
| 3 | Control de acceso por fases de venta | ✅ Implementado | `0657a2e` |
| 4 | Boleto con QR único ligado a la orden | ✅ Implementado | `9e2ac4d` |
| 5 | Historial de cambios de precio | ✅ Implementado | `2c1388e` |
| 6 | Reventa validada contra orden real | ✅ Implementado | `f94a5a1` |
| 7 | Modo dual: descubrimiento + venta directa | ✅ Implementado | `bdb6ce5` |
| 8 | Docker Compose para desarrollo en equipo | ✅ Implementado | `2c2a864` |

---

## Propuestas originales (implementadas)

### 1. Transparencia total de precio ✅

**Problema que resuelve:** comisiones y cargos ocultos que solo aparecen en el checkout (caso documentado con Ticketmaster España).

**Implementado en:**
- `serviceFeePercent` en `Event` + utilidad `pricing.ts`
- Desglose subtotal / comisión / total en `TicketForm` y precio final en `EventCard`

---

### 2. Límite de compra por usuario/evento (anti-acaparamiento) ✅

**Problema que resuelve:** acaparamiento de boletos por un mismo usuario/bot, que alimenta la reventa.

**Implementado en:**
- Validación en `POST /api/orders` (máx. 4 boletas por usuario y evento)
- Endpoint `GET /api/events/:id/purchase-info` para mostrar cupo restante en UI

---

### 3. Control de acceso por fases de venta (preventa vs. general) ✅

**Problema que resuelve:** falta de verificación temprana de membresía/rol antes de permitir la compra (caso BTS Colombia).

**Implementado en:**
- `presaleAccess` en `User`, `salePhase` en `Event`
- Bloqueo en backend y mensaje en frontend si el usuario no tiene acceso a preventa
- Usuario demo: `member@mainstage.co` / `member123`

---

### 4. Boleto con QR único ligado a la orden (anti-falsificación) ✅

**Problema que resuelve:** boletos falsos o no verificables.

**Implementado en:**
- `qrCode` y `qrUsed` en `Order`
- `GET /api/tickets/verify/:code` y `POST /api/tickets/verify/:code/use` (admin)
- Componentes `OrderQr` (perfil) y `AdminTicketVerify` (panel)

---

### 5. Historial de cambios de precio ✅

**Problema que resuelve:** precios dinámicos sin explicación (caso Shakira/Ticketmaster "Platinum").

**Implementado en:**
- Modelo `PriceHistory` con motivo del cambio
- Hook en `PUT /api/admin/events/:id` al modificar precio base
- Componente `PriceHistory` en detalle del evento

---

### 6. Reventa validada contra orden real ✅

**Problema que resuelve:** entradas especulativas listadas sin verificación (caso Viagogo / BTS Colombia).

**Implementado en:**
- Modelo `Resale` ligado a `Order` con estados `listed` / `sold` / `cancelled`
- Rutas en `resale.ts` + página `/reventa` y flujo desde el perfil

---

## Nuevas propuestas (implementadas en fase 1)

### 7. Modo dual: descubrimiento + venta directa ✅

**Problema que resuelve:** en Colombia no hay una API pública unificada de boletas (TuBoleta no expone API, Ticketmaster Discovery tiene cobertura limitada en CO). Forzar toda la compra dentro de MainStage sería deshonesto; ignorar eventos externos dejaría el catálogo vacío.

**Solución adoptada — modelo dual:**

| Modo | Campo | Comportamiento |
|------|-------|----------------|
| **Descubrimiento** | `isSellable: false` | MainStage muestra info y precio de referencia; CTA "Ver boletas en [fuente]" → `externalUrl` |
| **Venta directa** | `isSellable: true` | Inventario propio: compra interna, QR, preventa, reventa |

**Campos en `Event`:**
- `source`: `mainstage` | `tuboleta` | `ticketmaster` | `bandsintown` | `manual`
- `externalUrl`: enlace oficial de compra
- `isSellable`: boolean

**Implementado en:**
- Migración `20260713160000_add_event_source_sellable`
- Validación en `orders.ts` (rechaza compra si `!isSellable`)
- `TicketForm` con bloque externo + badge en `EventCard`
- Panel admin: selector de fuente, URL y checkbox "Venta directa en MainStage"
- Seed demo: Estéreo Picnic (MainStage), Karol G (TuBoleta), Shakira/Carnaval (Ticketmaster)

**Principio de producto:** sin mock de pago — el flujo es honesto según el tipo de evento.

---

### 8. Docker Compose para onboarding del equipo ✅

**Problema que resuelve:** cada integrante necesita PostgreSQL local, migraciones y seed sincronizados; errores `ECONNREFUSED` y `P1001` al levantar frontend sin backend/BD.

**Implementado en:**
- `docker-compose.yml` (desarrollo con hot reload)
- `docker-compose.prod.yml` (producción)
- `docker-entrypoint.sh` con migrate + seed automático (`SEED_ON_START`)

**Uso:** `docker compose up --build` → frontend `:5173`, API `:3001`, PostgreSQL `:5432`

---

## Propuestas futuras (fase 2 — para el equipo)

### 9. Integración con Bandsintown API (descubrimiento automático)

**Problema que resuelve:** el catálogo de eventos externos requiere carga manual en admin.

**Complejidad:** Media

**Implementación sugerida:**
- Job periódico o endpoint admin que consulte Bandsintown (única API pública viable para conciertos en CO)
- Importar eventos como `isSellable: false` con `source: bandsintown` y `externalUrl` del proveedor
- Deduplicar por artista + fecha + ciudad

**Dónde tocar:**
- `backend/src/services/bandsintown.ts` (nuevo)
- `backend/src/routes/admin.ts` → `POST /api/admin/events/import-external`

---

### 10. Notificaciones de bajada de precio

**Problema que resuelve:** usuarios que abandonan la compra cuando el precio sube sin aviso (complementa el historial de precios ya implementado).

**Complejidad:** Media

**Implementación sugerida:**
- Modelo `PriceAlert` (usuario + evento + precio objetivo)
- Al registrar cambio en `PriceHistory`, notificar usuarios suscritos (email o in-app)

---

### 11. Mapa de asientos / zonas (solo eventos MainStage)

**Problema que resuelve:** selección de zona sin contexto visual en venues grandes (Movistar Arena, Coliseo El Campín).

**Complejidad:** Alta

**Implementación sugerida:**
- Extender `TicketTier` con coordenadas o SVG de zona
- Selector visual en `TicketForm` solo para `isSellable: true`

---

### 12. Cola virtual simplificada (eventos de alta demanda)

**Problema que resuelve:** saturación en preventas masivas sin implementar infraestructura de cola distribuida.

**Complejidad:** Media-Alta

**Implementación sugerida:**
- Token de turno en Redis o tabla `QueueEntry` con TTL
- Pantalla de espera en frontend con posición estimada
- Solo activar en eventos marcados `highDemand: true` en admin

---

## Prioridad sugerida para fase 2

1. **#9 Bandsintown** — reduce carga manual del catálogo y demuestra integración con API real
2. **#10 Alertas de precio** — extiende el historial ya implementado con valor para el usuario
3. **#11 Mapa de asientos** — impacto visual alto, pero más esfuerzo de diseño/UX
4. **#12 Cola virtual** — solo si el proyecto escala a eventos de demanda extrema

---

## Referencias de problemas reales

- Ticketmaster España: comisiones ocultas hasta el checkout (2024–2025)
- Shakira / Ticketmaster "Platinum": precios dinámicos sin criterio público
- BTS Colombia: verificación de membresía tardía; reventas especulativas en Viagogo
- TuBoleta / mercado colombiano: sin API pública; usuarios navegan múltiples sitios sin comparar
