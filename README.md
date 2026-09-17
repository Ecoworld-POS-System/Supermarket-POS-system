<<<<<<< HEAD
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
>>>>>>> main
