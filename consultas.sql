-- ============================================================
--  Consultas de ejemplo  ·  Base de datos: mainstage (PostgreSQL)
--  Ejecutar con la extensión DBCode (botón "Run" sobre cada
--  consulta, o Ctrl+Enter con el cursor dentro de la sentencia).
--
--  IMPORTANTE: Prisma crea las tablas con Mayúscula inicial
--  ("User", "Event", "Order", "Venue") y varias columnas en
--  camelCase ("availableTickets", "createdAt", "buyerName"...).
--  En PostgreSQL eso obliga a usar comillas dobles "".
-- ============================================================


-- 1) Todos los usuarios registrados (sin mostrar la contraseña)
SELECT id, name, email, role, "createdAt"
FROM "User"
ORDER BY "createdAt" DESC;


-- 2) ¿Cuántos usuarios hay registrados?
SELECT COUNT(*) AS total_usuarios
FROM "User";


-- 3) Todos los eventos con precio y boletos disponibles
SELECT id, title, artist, category, city, date, price, "availableTickets"
FROM "Event"
ORDER BY date;


-- 4) Cuántos eventos hay por categoría
SELECT category, COUNT(*) AS cantidad
FROM "Event"
GROUP BY category
ORDER BY cantidad DESC;


-- 5) Solo los eventos destacados
SELECT title, artist, city, price
FROM "Event"
WHERE featured = true;


-- 6) Eventos en una ciudad específica (cambia 'Bogotá' por otra)
SELECT title, artist, date, price
FROM "Event"
WHERE city = 'Bogotá'
ORDER BY date;


-- 7) Todas las compras (órdenes) realizadas
SELECT id, "confirmationCode", "buyerName", "eventTitle",
       quantity, "totalPrice", "createdAt"
FROM "Order"
ORDER BY "createdAt" DESC;


-- 8) Totales del negocio: nº de órdenes, boletos vendidos e ingresos
SELECT COUNT(*)          AS total_ordenes,
       SUM(quantity)     AS boletos_vendidos,
       SUM("totalPrice") AS ingresos_totales
FROM "Order";


-- 9) Ranking de eventos más vendidos (por ingresos)
SELECT "eventTitle",
       SUM(quantity)     AS boletos,
       SUM("totalPrice") AS ingresos
FROM "Order"
GROUP BY "eventTitle"
ORDER BY ingresos DESC;


-- 10) Compras cruzadas con el usuario que las hizo (JOIN entre tablas)
SELECT u.name  AS usuario,
       u.email AS correo,
       o."eventTitle",
       o.quantity,
       o."totalPrice"
FROM "Order" o
JOIN "User" u ON u.id = o."userId"
ORDER BY o."createdAt" DESC;


-- 11) Escenarios (venues) ordenados por capacidad
SELECT name, city, capacity
FROM "Venue"
ORDER BY capacity DESC;
