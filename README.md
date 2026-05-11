# WabiSeminar

Real-time seminar rooms: React clients talk to an Express API and Socket.IO; auth uses JWT; state lives in MongoDB.

## Stack

- **Client** — React 19, Vite, Tailwind, React Router, Socket.IO client  
- **Server** — Express 5, Socket.IO, Mongoose, bcrypt, JWT  

## Prerequisites

- [Node.js](https://nodejs.org/) (current LTS is fine)  
- [MongoDB](https://www.mongodb.com/) running locally or a `MONGODB_URI` you can reach  

## Local development

1. **Server** — In `server/`, copy `.env.example` to `.env` and set `JWT_SECRET`, `MONGODB_URI`, and `CLIENT_URL` (default dev: `http://localhost:5173`).  
2. **Client** — In `client/`, copy `.env.example` to `.env`. Point `VITE_API_URL` at the API (default: `http://localhost:5000`).  
3. Install and run both apps:

   ```bash
   cd server && npm install && npm run dev
   ```

   ```bash
   cd client && npm install && npm run dev
   ```

4. Open the app at [http://localhost:5173](http://localhost:5173) (Vite). The API listens on the port in `server/.env` (default `5000`).

**Production:** set `CLIENT_URL` to your deployed frontend origin and `VITE_API_URL` to your deployed API URL (no trailing slash).
