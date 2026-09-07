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
