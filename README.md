 lakna-Authentication-&-User-Management
# Authentication and User Management

This component provides authentication and staff account management for the EgoTech World retail system. It gives employees a sign-in screen and administrators a central place to manage staff identities, roles, branches, and account status.

## Scope

This component covers:

- Employee sign-in using an employee ID, username, or email address
- Active and inactive account handling
- Role-based staff records for Admin, Manager, Cashier, Supervisor, and Inventory Staff
- Branch assignment for each employee
- User search by name, employee ID, or email
- Filtering users by role and account status
- Adding, editing, activating, deactivating, and deleting users
- Last-login tracking and current-user session persistence
- Responsive layouts for desktop, tablet, and mobile screens

## Main Screens

### Login

The login screen supports:

- Employee ID or username input
- Password visibility toggle
- Remember-this-station option
- Loading and validation states
- Clear messages for invalid or deactivated accounts
- Quick demo sign-ins for Admin, Cashier, Manager, and Inventory Staff personas

### User Management

The staff management screen provides:

- Total, active, and inactive staff counts
- Search and role/status filters
- Employee ID, email, role, branch, status, and last-activity details
- Add and edit user modal forms
- Generated employee IDs and temporary passwords for new accounts
- User activation/deactivation controls
- Delete confirmation before removing an account

## Roles and Branches

Supported roles:

- Admin
- Manager
- Cashier
- Supervisor
- Inventory Staff

Configured branches include Colombo Head Office, Kandy, Galle, Negombo, and Matara.

## Technology

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Client persistence:** Browser `localStorage` for the demo session and user list

## Project Structure

```text
backend/
  models.js       User schema and related data models
  server.js       Express API, authentication, and user routes
frontend/
  AuthUserManagement.jsx
  src/
    components/auth/LoginPage.jsx
    components/users/UserManagementPage.jsx
    components/users/UserModal.jsx
    context/AppContext.jsx
```

## API Endpoints

### Authentication

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Sign in with an employee ID, username, or email |

### Users

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/users` | List users |
| `POST` | `/api/users` | Create a user |
| `PUT` | `/api/users/:id` | Update user details |
| `PATCH` | `/api/users/:id/status` | Toggle Active/Inactive status |
| `DELETE` | `/api/users/:id` | Delete a user |

The backend also exposes `GET /api/health` for a basic service health check.

## Getting Started

### Prerequisites

- Node.js 16 or newer
- A MongoDB instance accessible by the backend

### Install dependencies

From the project root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### Start the backend

In one terminal:

```bash
cd backend
npm run dev
```

The API listens on `http://localhost:5000` by default.

### Start the frontend

In a second terminal:

```bash
cd frontend
npm run dev
```

Vite prints the local frontend URL, normally `http://localhost:5173`.

### Build the frontend

```bash
cd frontend
npm run build
```

## Demo Login

The demo supports the seeded Administrator account and quick persona buttons on the login screen. In the current demo flow, `admin123` can be used as the password for a quick login or for a valid demo sign-in.

For production use, replace the demo authentication flow with hashed passwords, signed sessions or JWTs, protected API middleware, and environment-based database configuration.

## Notes

- The current React context persists users and the active session in browser `localStorage`.
- The backend connects to MongoDB and seeds initial user data when the users collection is empty.
- Account status is checked during login, so inactive users cannot sign in.
=======
 HEAD
# POS System

A Point of Sale (POS) system with separate Frontend and Backend.

## Project Structure

```
POS System/
├── Frontend/    → React + Vite application
└── Backend/     → Express.js API server
```

## Getting Started

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

The frontend dev server will start at `http://localhost:5173`.

### Backend

```bash
cd Backend
cp .env.example .env    # Configure environment variables
npm install
npm run dev
```

The backend server will start at `http://localhost:5000`.

## Tech Stack

- **Frontend:** React 19, Vite 8, React Router, Lucide Icons
- **Backend:** Express.js, CORS, dotenv
=======
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
 main
main
