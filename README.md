# 🍔 CraveGo (formerly Order Management System)

A production-grade, full-stack food delivery order management application built with **React 19**, **NestJS**, **TypeORM**, **MySQL**, and **Socket.IO**. This project features real-time order tracking, comprehensive checkout workflows, database migrations, and an administrative control panel.

---

## 🚀 Key Features

### 🛒 Customer App
- **Interactive Menu Browser:** Browse dishes with rich imagery, instant keyword search, and real-time category filtering.
- **Persistent Shopping Cart:** Powered by Zustand and synced with browser `localStorage`, featuring automated calculations for subtotal, delivery fee (₹3.99), tax rate (8.25%), and total.
- **Secured Checkout:** Comprehensive shipping and billing validation using **React Hook Form** + **Zod**.
- **Real-Time Order Tracking:** Real-time updates pushed from the NestJS backend via **Socket.IO** with visual step-by-step progress timelines.
- **Personal Order History:** Searchable history log with statuses, ordering timelines, and past order details.

### 👑 Admin Dashboard
- **Analytics Overview:** Real-time revenue reporting, active order statistics, and status distribution charts built with **Recharts**.
- **Interactive Menu Management:** Add, update, and remove menu items dynamically.
- **Live Order Control:** View all incoming orders, update their preparation statuses, and trigger real-time updates to the customer.

### 🛡️ Core & Infrastructure
- **Role-Based Guards:** Route & API-level security segregating `ADMIN` and `CUSTOMER` roles.
- **Robust Auth System:** Secure JWT authentication featuring access/refresh token rotation and bcryptjs password hashing.
- **Security Best Practices:** Pre-configured with Helmet headers, CORS policies, rate limiting, and NestJS `ValidationPipe`.
- **Database Migrations:** Clean schemas with relational integrity, foreign keys, and indexes managed through TypeORM migrations.
- **Auto-Seeding:** Instantly seeds system categories, menu items, and a default admin user on first application boot.

---

## 🛠️ Tech Stack

| Frontend | Backend | Database & DevOps |
| :--- | :--- | :--- |
| **React 19** & **Vite** | **NestJS** (v11) | **MySQL** (v8) |
| **TypeScript** | **TypeScript** | **TypeORM** |
| **TailwindCSS** (v3) | **Socket.IO Server** | **Husky** & **Commitlint** |
| **TanStack Query** (v5) | **Passport JWT** | **ESLint** & **Prettier** |
| **Zustand** (v5) | **Helmet** & **Throttler** | **Jest** & **Supertest** (Backend Tests) |
| **Framer Motion** | **Class Validator / Transformer** | **Vitest** & **React Testing Library** (Frontend) |

---

## 📁 Monorepo Folder Structure

The project is structured as a monorepo utilizing npm workspaces:

```text
├── Backend/                   # NestJS Backend API
│   ├── src/
│   │   ├── database/          # Database migrations, entities, & seed files
│   │   ├── modules/           # NestJS modules (auth, menu, orders, dashboard)
│   │   └── main.ts            # NestJS entry point
│   ├── test/                  # E2E test suites
│   ├── package.json
│   └── tsconfig.json
├── Frontend/                  # Vite + React Frontend Client
│   ├── src/
│   │   ├── components/        # Reusable global components
│   │   ├── features/          # Feature modules (cart, checkout, tracking)
│   │   ├── hooks/             # Custom utility hooks
│   │   ├── pages/             # Layouts & pages (Admin, Store, Auth)
│   │   └── store/             # Zustand state management
│   ├── package.json
│   └── vite.config.ts
├── database/                  # SQL seed backups
│   └── seed.sql
├── docs/                      # Postman & documentation resources
│   └── postman_collection.json
├── package.json               # Root workspace package configuration
└── pnpm-workspace.yaml / workspaces setup
```

---

## 🗄️ Database Architecture

Below is the database schema entity-relationship diagram:

```mermaid
erDiagram
    users {
        varchar id PK
        varchar name
        varchar email UK
        varchar passwordHash
        enum role
        varchar refreshTokenHash
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }
    categories {
        varchar id PK
        varchar name UK
        varchar slug UK
        varchar description
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }
    menu_items {
        varchar id PK
        varchar categoryId FK
        varchar name UK
        varchar slug UK
        text description
        decimal price
        varchar imageUrl
        tinyint isAvailable
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }
    image_assets {
        varchar id PK
        varchar url
        varchar menuItemId FK
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }
    orders {
        varchar id PK
        varchar orderNumber UK
        varchar customerName
        varchar phone
        varchar address
        varchar city
        varchar state
        varchar zipCode
        text instructions
        enum status
        decimal subtotal
        decimal deliveryFee
        decimal tax
        decimal total
        datetime estimatedDeliveryAt
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }
    order_items {
        varchar id PK
        varchar orderId FK
        varchar menuItemId FK
        int quantity
        decimal unitPrice
        decimal lineTotal
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }
    order_status_history {
        varchar id PK
        varchar orderId FK
        enum status
        text note
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    categories ||--o{ menu_items : "contains"
    menu_items ||--o{ image_assets : "has"
    orders ||--o{ order_items : "contains"
    menu_items ||--o{ order_items : "ordered_in"
    orders ||--o{ order_status_history : "tracks"
```

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js** v18+ & **npm** v9+
- **MySQL** instance running locally or on a server

### 1. Installation
Install workspace-wide node modules from the repository root:
```bash
npm install
```

### 2. Configure Environment Variables
Create configurations for both directories:

#### Backend (`Backend/.env`)
```ini
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173

# MySQL Connection Details
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=order_management
DATABASE_URL="mysql://root:your_mysql_password@localhost:3306/order_management"

# JWT Config
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d

# Fees & Calculations
DELIVERY_FEE=3.99
TAX_RATE=0.0825
```

#### Frontend (`Frontend/.env`)
```ini
VITE_API_URL=http://localhost:4000
```

### 3. Setup Database Schema
Before running migrations, make sure MySQL is running and your database is created:
```sql
CREATE DATABASE IF NOT EXISTS order_management;
```
Then run the migrations using the root script command:
```bash
npm run migration:run
```
> [!NOTE]
> Database seeding executes automatically on the backend startup (`npm run dev`) if the database tables are empty. A default admin user is seeded automatically.

**Default Credentials:**
- **Email:** `admin@example.com`
- **Password:** `Password123!`

---

## 💻 Available Scripts

All scripts can be run directly from the workspace root folder:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs both Frontend and Backend servers concurrently in development mode |
| `npm run build` | Builds both Frontend client and Backend API packages for production |
| `npm run test` | Executes workspace test suites (`vitest` on client, `jest` on API) |
| `npm run lint` | Runs eslint across the client application and backend server code |
| `npm run migration:run` | Runs pending TypeORM database schema migrations on the MySQL server |
| `npm run migration:generate` | Generates a new database migration file (e.g. `npm run migration:generate -- -n MigrationName`) |
| `npm run format` | Runs Prettier to auto-format files workspace-wide |

---

## 📡 API Endpoints & Swagger

Swagger documentation is generated automatically and is accessible at `http://localhost:4000/docs`.

### Authentication
- `POST /auth/register` - Create customer account
- `POST /auth/login` - Retrieve access and refresh tokens
- `POST /auth/refresh` - Refresh an expired access token
- `POST /auth/logout` *(Auth Guarded)* - Revoke session refresh tokens

### Menu
- `GET /menu` - Fetch menu list (supports category and search queries)
- `GET /menu/:id` - Fetch details of a specific menu item
- `POST /menu` *(Admin Guarded)* - Create a menu item
- `PATCH /menu/:id` *(Admin Guarded)* - Update a menu item
- `DELETE /menu/:id` *(Admin Guarded)* - Soft delete a menu item

### Orders
- `POST /orders` - Place a new order
- `GET /orders` - Retrieve list of orders (supports query filters)
- `GET /orders/:id` - Retrieve order details and timeline status history
- `PATCH /orders/:id/status` *(Admin Guarded)* - Update active order step & notes
- `DELETE /orders/:id` *(Admin Guarded)* - Cancel an order

### Dashboard
- `GET /dashboard/stats` *(Admin Guarded)* - Retrieve administrative performance charts & stats

---

## 🧪 Testing

Execute test suites for both packages using the command below:
```bash
npm run test
```
- **Backend Tests:** Run using **Jest** framework for unit and controller validation testing.
- **Frontend Tests:** Run using **Vitest** and **React Testing Library** for components, forms, and custom React hook validation.
