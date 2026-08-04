# Order Management System

Food delivery order management application built with React 19, TypeScript, TailwindCSS, TanStack Query, NestJS, Prisma and MySQL.

## What Is Included

- Customer menu with real images, search, category filter, sorting and item details.
- LocalStorage cart using Zustand with add, remove, quantity update, clear, subtotal, delivery fee, tax and total.
- Zod + React Hook Form checkout validation.
- Order creation with generated order number, timestamp, estimated delivery time and status history.
- Socket.IO order status updates with backend simulation.
- Order history with search, status filter and order detail timeline.
- Admin dashboard with stats, charts, menu management and order status updates.
- JWT auth, refresh tokens, role guards, Helmet, CORS, rate limiting, ValidationPipe and global exception handling.
- Prisma schema for MySQL with relationships, indexes, timestamps and soft-delete fields.
- Tests for backend services and frontend cart/form/UI behavior.

## Tech Stack

- Frontend: React, Vite, TypeScript, TailwindCSS, TanStack Query, React Hook Form, Zod, Zustand, Fetch API, Socket.IO Client, Framer Motion, Lucide Icons, React Hot Toast, Recharts.
- Backend: NestJS, TypeScript, Prisma ORM, MySQL, Socket.IO, JWT, bcrypt.
- Testing: Jest, Supertest, Vitest, React Testing Library.

## Setup

```bash
npm install
copy Backend\.env.example Backend\.env
copy Frontend\.env.example Frontend\.env
npm run prisma:generate
npm run db:push
npm run dev
```

Update `Backend/.env` with your local MySQL credentials before running `db:push`.

Default seeded admin:

```text
admin@example.com
Password123!
```

## Scripts

```bash
npm run dev
npm run build
npm run test
npm run lint
npm run prisma:generate
npm run db:push
```

## API

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /menu`
- `GET /menu/:id`
- `POST /menu`
- `PATCH /menu/:id`
- `DELETE /menu/:id`
- `POST /orders`
- `GET /orders`
- `GET /orders/:id`
- `PATCH /orders/:id/status`
- `DELETE /orders/:id`
- `GET /dashboard/stats`

Swagger runs at `http://localhost:4000/docs`.

## Folder Structure

```text
Backend/
  prisma/
  src/modules/auth
  src/modules/database
  src/modules/menu
  src/modules/orders
  src/modules/dashboard
  src/modules/common
Frontend/
  src/components
  src/features
  src/hooks
  src/layouts
  src/pages
  src/routes
  src/services
  src/store
  src/styles
docs/
```
