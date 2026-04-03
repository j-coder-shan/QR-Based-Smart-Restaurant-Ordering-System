# QR-Based Smart Restaurant Ordering System

This system is a QR code–based smart restaurant solution that allows customers to order food using their mobile devices without creating an account. It is designed to improve efficiency in restaurants by minimizing human interaction and operating with only one waiter.

## Phase 1: Basic Setup

This repository contains the foundation for both the backend (Node.js/Express) and frontend (React/Vite) parts of the Intelligent Restaurant Ordering System.

### Prerequisites

- **Node.js**: Ensure Node.js and NPM are installed.
- **PostgreSQL**: Ensure PostgreSQL is running locally on port 5433 (e.g. Postgres 17 if installed alongside 10). You must have a database named `restaurant_db` created.

### Project Structure
- `/backend`: Node.js + Express API server, integrated with Prisma ORM for database modeling.
- `/frontend`: React application configured with Vite, React Router, Axios, and TailwindCSS v4.

### Getting Started

#### 1. Setup Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Set up your `.env` file (one is provided by default pointing to `restaurant_db`):
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:password@localhost:5433/restaurant_db"
   ```
3. Initialize the database schema (after ensuring `restaurant_db` is created in Postgres):
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server runs on `http://localhost:5000`.*

#### 2. Setup Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client runs on `http://localhost:5173`. Open it to see the landing page!*

### Future Features to be Implemented
- **QR Code System**: Generating unique table QR codes and reading them.
- **Order Management**: Real-time order creation and updates from customer to kitchen.
- **Kitchen Dashboard**: Web interface for kitchen staff to manage pending and completed orders.
- **Admin Panel & Real-time Updates**: Socket.io or polling integration.
