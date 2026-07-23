# MainStage

Plataforma web de venta de boletos para conciertos y eventos en **Colombia**.

## Stack

- **Backend:** Node.js + Express + TypeScript
- **ORM:** Prisma
- **Base de datos:** PostgreSQL
- **Frontend:** React + Vite + TypeScript + Framer Motion
- **Estado:** Redux Toolkit + React Redux
- **Reactividad:** RxJS (búsqueda instantánea)
- **Contenedores:** Docker Compose (desarrollo y producción)

## Modelo dual de eventos

MainStage combina dos modos según el origen del evento:

| Modo | `isSellable` | Comportamiento |
|------|--------------|----------------|
| **Venta directa** | `true` | Compra interna con QR, preventa, límite de boletas y reventa validada |
| **Descubrimiento** | `false` | Muestra precio de referencia y redirige al sitio oficial (`externalUrl`) |

Fuentes soportadas: `mainstage`, `tuboleta`, `ticketmaster`, `bandsintown`, `manual`.

## Features diferenciales implementadas

1. **Precio transparente** — desglose de comisión de servicio (`serviceFeePercent`) antes de comprar
2. **Límite de compra** — máximo 4 boletas por usuario y evento
3. **Fases de venta** — preventa exclusiva para usuarios con `presaleAccess`
4. **Boletos con QR** — código único por orden, verificación y uso en puerta (admin)
5. **Historial de precios** — registro automático al editar el precio base de un evento
6. **Reventa validada** — solo boletos comprados en MainStage pueden revenderse
7. **Modo dual** — eventos externos como referencia vs. inventario propio vendible

## Estructura

```
MainStage/
├── docker-compose.yml        # Desarrollo (hot reload)
├── docker-compose.prod.yml   # Producción
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # User, Event, Order, TicketTier, PriceHistory, Resale
│   │   ├── migrations/
│   │   └── seed.ts
│   └── src/
│       ├── lib/pricing.ts    # Cálculo de precios y comisiones
│       ├── middleware/       # JWT + rol admin
│       └── routes/           # events, orders, auth, tickets, resale, admin
└── frontend/
    └── src/
        ├── components/       # EventCard, TicketForm, OrderQr, PriceHistory...
        ├── pages/            # Home, EventDetail, Profile, Resale, Admin
        └── services/api.ts   # Cliente HTTP tipado
```

## Inicio rápido con Docker (recomendado)

### Requisitos

- Docker Desktop 4+

### Levantar todo el stack

```bash
docker compose up --build
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3001 |
| PostgreSQL | localhost:5432 (`postgres` / `postgres`, BD `mainstage`) |

El backend aplica migraciones y ejecuta el seed automáticamente al iniciar (`SEED_ON_START=true`).

### Despliegue en servidor (producción)

Archivos clave:

| Archivo | Rol |
|---------|-----|
| `backend/Dockerfile` | Multi-stage `deps` → `builder` → `runner` (tini, usuario no-root, healthcheck) |
| `frontend/Dockerfile` | Multi-stage `deps` → `builder` → `runner` (nginx) |
| `backend/docker-entrypoint.sh` | Migraciones (+ seed opcional) al arrancar |
| `docker-compose.yml` | Desarrollo local con hot reload |
| `docker-compose.prod.yml` | Stack completo para servidor |

En el servidor:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

| Servicio | URL |
|----------|-----|
| App (frontend + `/api`) | http://SERVIDOR:8080 |
| PostgreSQL | solo red interna Docker |

Variables opcionales (`.env` junto al compose):

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=cambia-esto
POSTGRES_DB=mainstage
JWT_SECRET=cambia-esto-tambien
APP_PORT=8080
SEED_ON_START=false
```

Para cargar datos demo en el primer arranque: `SEED_ON_START=true`.

## Inicio rápido local (sin Docker)

### Requisitos

- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edita DATABASE_URL en .env

npm run prisma:migrate
npm run db:seed
npm run dev
```

La API corre en `http://localhost:3001`

| Script | Descripción |
|--------|-------------|
| `npm run dev` | API en modo desarrollo |
| `npm run build` | Compila TypeScript |
| `npm run prisma:migrate` | Aplica migraciones |
| `npm run db:seed` | Carga datos demo |
| `npm run db:reset` | Reinicia BD y vuelve a sembrar |

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La app corre en `http://localhost:5173` (proxy `/api` → `localhost:3001`).

## Usuarios demo

| Email | Contraseña | Rol | Notas |
|-------|------------|-----|-------|
| `admin@mainstage.co` | `admin123` | Admin | Panel `/admin`, verificación QR |
| `member@mainstage.co` | `member123` | Usuario | Acceso a preventa (`presaleAccess`) |

## API Endpoints

### Públicos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/events` | Lista eventos (filtros: `category`, `city`, `artist`, `date`, `search`, etc.) |
| GET | `/api/events/:id` | Detalle de evento |
| GET | `/api/events/:id/price-history` | Historial de cambios de precio |
| GET | `/api/events/categories` | Categorías |
| GET | `/api/events/cities` | Ciudades con eventos |
| GET | `/api/resale` | Listado de reventas activas |
| GET | `/api/tickets/verify/:code` | Consultar boleto por código QR |
| POST | `/api/auth/register` | Registro |
| POST | `/api/auth/login` | Inicio de sesión |

### Autenticados

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/auth/me` | Perfil |
| GET | `/api/events/:id/purchase-info` | Info de compra (límite restante, preventa) |
| POST | `/api/orders` | Crear orden (solo eventos `isSellable`) |
| GET | `/api/orders/my` | Mis compras |
| GET | `/api/tickets/my/:orderId/qr` | QR de una orden |
| GET | `/api/resale/my` | Mis publicaciones de reventa |
| POST | `/api/resale` | Publicar boleto en reventa |
| POST | `/api/resale/:id/buy` | Comprar reventa |
| DELETE | `/api/resale/:id` | Cancelar publicación |

### Admin

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/stats` | Estadísticas de ventas |
| GET | `/api/admin/orders` | Todas las órdenes |
| GET | `/api/admin/users` | Usuarios registrados |
| GET | `/api/admin/events` | Eventos (admin) |
| POST | `/api/admin/events` | Crear evento |
| PUT | `/api/admin/events/:id` | Editar evento |
| DELETE | `/api/admin/events/:id` | Eliminar evento |
| POST | `/api/tickets/verify/:code/use` | Marcar boleto como usado en puerta |

## Eventos demo en el seed

- **Estéreo Picnic** — venta directa MainStage (`isSellable: true`)
- **Karol G** — referencia TuBoleta (CTA externo)
- **Shakira / Carnaval de Barranquilla** — referencia Ticketmaster

## Ciudades con eventos

Bogotá, Medellín, Cali, Barranquilla, Cartagena, Bucaramanga, Cúcuta, Santa Marta y más.

## Paleta de colores

- Negro (`#0a0a0a`)
- Grises (`#1a1a1a` → `#eeeeee`)
- Blanco (`#ffffff`)
- Degradados entre estos tonos

## Tipografía

- **Display:** Syne
- **Body:** DM Sans
