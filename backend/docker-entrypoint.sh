#!/bin/sh
set -e

echo ">> Aplicando migraciones..."
npx prisma migrate deploy

if [ "$SEED_ON_START" = "true" ]; then
  echo ">> Cargando datos iniciales (seed)..."
  npm run db:seed
fi

echo ">> Iniciando API..."
exec "$@"
