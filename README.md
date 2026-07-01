# MainStage

Plataforma web de venta de boletos para conciertos y eventos en **Colombia**.

## Stack

- **Backend:** Express.js (API REST)
- **Frontend:** React + Vite + Framer Motion

## Estructura

```
MainStage/
├── backend/          # API Express
│   ├── data/         # Datos de eventos (mock)
│   ├── routes/       # Rutas de eventos y órdenes
│   └── server.js
└── frontend/         # App React
    └── src/
        ├── components/
        ├── pages/
        └── services/
```

## Inicio rápido

### Backend

```bash
cd backend
npm install
npm run dev
```

La API corre en `http://localhost:3001`

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
