# 🧱 DevJourney — Build Your Skills, Brick by Brick

DevJourney is a gamified full-stack platform designed for developers to master their craft through real-world missions. Built with a stunning LEGO and Minecraft-inspired aesthetic, it turns the learning process into an epic building adventure.

![DevJourney Preview](https://devjourney-gray.vercel.app/readmeFile.png)

## 🚀 Concept
DevJourney bridges the gap between learning and doing. Builders (users) take on missions, submit their solutions via GitHub, and earn XP to climb the global leaderboard. The platform features a specialized interface for Teachers to review and validate submissions, ensuring high-quality learning.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS & Vanilla CSS
- **State Management**: Zustand
- **API Client**: Axios with Interceptors
- **Icons**: Lucide React & Custom Pixel Icons

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (Double Token System - Access & Refresh)
- **Security**: Double-Cookie Strategy (HTTPOnly & SameSite)

## ✨ Features

- **🛡️ Secure Base (Auth)**: Registration and Login with robust JWT management.
- **📊 Mission Control (Dashboard)**: Track your rank, XP, and mission history in a beautiful pixelated interface.
- **🗺️ Discovery Map (Challenges)**: Browse missions sorted by difficulty (Beginner to Master).
- **👷 Builder Profile**: Real-time stats synchronization from the database.
- **🏆 Global Leaderboard**: Competative ranking system for all verified builders.
- **👨‍🏫 Teacher Panel**: Dedicated tools to review, approve, or reject student submissions with feedback.

## 📦 Project Structure

```bash
DevJourney/
├── frontend_devjourney/    # Next.js Application
│   ├── app/                # Pages & Routing
│   ├── components/         # Reusable LEGO-style UI Kits
│   ├── store/              # Zustand Auth Store
│   └── lib/                # API Client & Utils
└── backend_devJourney/     # Express.js Server
    ├── controllers/        # Business Logic
    ├── models/             # MongoDB Schemas
    ├── routes/             # API Endpoints
    └── middleware/         # Auth & Admin Guards
```

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/med1seghir5/DevJourney.git
cd DevJourney
```

### 2. Setup Backend
```bash
cd backend_devJourney
npm install
# Create a .env file with:
# PORT=5000
# DATABASE_URL=your_mongodb_uri
# JWT_SECRET=your_secret
# REFRESH_TOKEN_SECRET=your_refresh_secret
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend_devjourney
npm install
# Create a .env.local file with:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
```

## 🎨 Design System

The UI is built using a custom "Lego Design System", utilizing:
- **LegoCard**: 3D extruded containers with studs.
- **LegoButton**: Interactive blocks with press-down animations.
- **Pixel Typography**: Use of *Press Start 2P* and *VT323* Google Fonts.
- **Vibrant Color Palette**: LEGO Blue, Yellow, Red, and Green.