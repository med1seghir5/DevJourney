# ⚙️ DevJourney - Backend API

The robust, ultra-fast server acting as the backbone of the "DevJourney" gamified developer learning platform. It manages user authentication, challenge progression, GitHub repository validations, XP tracking, and dynamic leaderboards.

## 🚀 Features

- **Flexible Authentication System**: Users can sign up and login via an `email` or their unique `username`. Fully secured with JSON Web Tokens (JWT) and Bcrypt encryption.
- **Role-Based Access Control**: Standard users build code, while `teacher` and `admin` roles can create new coding challenges, view student submissions, and validate them for XP.
- **RESTful Architecture**: Clean, modular, and organized APIs providing logical domain separations (`/auth`, `/users`, `/challenges`, `/submissions`, `/leaderboard`).
- **Validation Engine**: Strict incoming request schema enforcement using **Joi** to maintain data integrity.
- **Smart Analytics**: Fast indexing, caching layers utilizing `node-cache`, and real-time XP recalculations.
- **Protection Measures**: Built-in comprehensive rate limiting mechanisms to stop DDoS abuse or brute-forcing endpoints.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Server**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) & [Mongoose v8](https://mongoosejs.com/)
- **Security**: JWT (`jsonwebtoken`), Bcrypt, Cookie-Parser, express-rate-limit
- **Validation**: Joi
- **Caching**: Node-Cache

## 💻 Getting Started

### Prerequisites

You must have **Node.js** and a fresh **MongoDB Cluster URL** (e.g. via MongoDB Atlas serverless database).

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend_devJourney
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the required `.env` file at the root of `backend_devJourney`:
   ```env
   # Application Configuration
   PORT=5000
   NODE_ENV=development
   
   # Data Source
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/devjourney?retryWrites=true&w=majority

   # Secrets
   JWT_SECRET=super_secret_key_123456
   
   # Frontend origin to allow CORS communication
   FRONTEND_URL=http://localhost:3000
   ```

4. You can start the server locally in development mode:
   ```bash
   npm run dev
   ```

## 🏗️ Structure

- `/controllers` - The core business logic separating concerns for every endpoint.
- `/models` - The Mongoose schema definitions (`User`, `Challenge`, `Submission`).
- `/routes` - The Express Router definitions linking controllers to standard HTTP verbs.
- `/middleware` - Route guards intercepting requests for Authorization checks (JWT verify) and Request parameter validation (Joi).
- `/services` - Modular implementations for background tasks (e.g., Caching).
- `/utils` - Error handling factories and generic tools.

## 🚢 Deployment (Render.com)

1. Make sure your Typescript code can comfortably compile:
   ```bash
   npm run build
   ```
2. Link your Git Repository to Render.
3. Configure the following build options for a Web Service format:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Set all your application `.env` variables under the "Environment" tab on the Render Dashboard. (Ensure `FRONTEND_URL` is set to your deployed Vercel domain).

---
*Powered by Node, Express & MongoDB.* ⚙️
# devjourney-1
