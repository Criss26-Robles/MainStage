# MainStage

Plataforma web de venta de boletos para conciertos y eventos en **Colombia**.

## Stack

- **Backend:** Node.js + Express + TypeScript
- **ORM:** Prisma
- **Base de datos:** PostgreSQL
- **Frontend:** React + Vite + TypeScript + Framer Motion
- **Estado:** Redux Toolkit + React Redux
- **Reactividad:** RxJS (búsqueda instantánea)

## Estructura

```
MainStage/
├── backend/              # API Express en TypeScript
│   ├── prisma/
│   │   ├── schema.prisma # Modelos (User, Event, Order, Venue)
│   │   ├── migrations/   # Migraciones versionadas
│   │   └── seed.ts       # Datos iniciales (eventos, venues, admin)
│   ├── src/
│   │   ├── lib/          # Cliente Prisma compartido
│   │   ├── middleware/   # Autenticación JWT y rol admin
│   │   ├── routes/       # events, orders, auth, venues, admin
│   │   ├── types/        # Tipos compartidos
│   │   └── server.ts     # Bootstrap de la API
│   ├── .env              # DATABASE_URL, JWT_SECRET, PORT (no se versiona)
│   └── tsconfig.json
└── frontend/             # App React + TypeScript (Vite)
    ├── tsconfig.json
    └── src/
        ├── components/   # Componentes .tsx (props tipadas)
        ├── pages/        # Vistas y panel admin
        ├── hooks/        # useAuth, useEventSearchStream (RxJS)
        ├── store/        # Redux Toolkit (slices + hooks tipados)
        ├── services/     # Cliente de API tipado
        └── types.ts      # Interfaces de dominio (Event, Order, User, Venue)
```

## Inicio rápido

### Requisitos

- Node.js 18+
- PostgreSQL 14+ corriendo localmente

### Backend

```bash
cd backend
npm install

# 1. Configura las variables de entorno
cp .env.example .env
# Edita .env y coloca tu contraseña de PostgreSQL en DATABASE_URL

# 2. Crea la base de datos, aplica las tablas y carga los datos iniciales
npm run prisma:migrate      # crea la BD "mainstage" y las tablas
npm run db:seed             # 14 eventos, 6 escenarios y usuario admin

# 3. Levanta la API
npm run dev
```

La API corre en `http://localhost:3001`

**Scripts disponibles:**

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Levanta la API en modo desarrollo (ts-node) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Ejecuta la versión compilada |
| `npm run prisma:migrate` | Crea/actualiza la base de datos con migraciones |
| `npm run db:seed` | Carga los datos iniciales |
| `npm run db:reset` | Reinicia la BD y vuelve a sembrar (borra todo) |

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La app corre en `http://localhost:5173`

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/events` | Lista eventos (filtros: `category`, `city`, `artist`, `date`, `month`, `dateFrom`, `dateTo`, `featured`, `search`) |
| GET | `/api/events/:id` | Detalle de un evento |
| GET | `/api/events/categories` | Categorías disponibles |
| GET | `/api/events/cities` | Ciudades con eventos activos |
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Perfil del usuario autenticado |
| POST | `/api/orders` | Crear orden de compra (requiere auth) |
| GET | `/api/admin/stats` | Estadísticas de ventas (admin) |
| GET | `/api/admin/orders` | Todas las ventas (admin) |
| GET | `/api/admin/events` | Listar eventos (admin) |
| POST | `/api/admin/events` | Crear evento (admin) |
| PUT | `/api/admin/events/:id` | Editar evento (admin) |
| DELETE | `/api/admin/events/:id` | Eliminar evento (admin) |

## Usuario administrador

Al iniciar el backend se crea automáticamente:

- **Email:** admin@mainstage.co
- **Contraseña:** admin123

Accede al panel en `/admin` después de iniciar sesión.
| GET | `/api/health` | Health check |

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
