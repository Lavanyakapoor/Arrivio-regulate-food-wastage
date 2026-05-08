# 🥗 Arrivio — Intelligent Household Food Waste Prevention Platform

---

## 📋 Project Information

| Field | Details |
|---|---|
| **Name** | Lavanya Kapoor |
| **Roll Number** | 2210991850 |
| **Type** | Copyright |
| **Institution** | Chitkara University, Rajpura, Punjab |
| **Team Members** | Lavanya Kapoor — 2210991850 |
| **Submitted To** | Dr. Preeti Saini |
| **Current Status** | ✅ Submitted |

---

> **Track. Alert. Donate. Impact.**  
> A full-stack web application that empowers households to reduce food waste, donate near-expiry items, and measure their personal environmental footprint.

---

## 📌 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Environment Variables](#4-environment-variables)
  - [5. Running the Application](#5-running-the-application)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [Research & References](#research--references)
- [Future Roadmap](#future-roadmap)
- [Authors](#authors)

---

## About the Project

**Arrivio** was built to address one of the most underestimated household problems — food waste. Globally, **1.3 billion tonnes** of food is wasted every year, and nearly **30% of all household food** is discarded without being consumed, often due to poor inventory management.

Arrivio is the **first unified platform** (to the best of our knowledge) that combines:
- Expiry-based household inventory tracking
- Peer-to-peer community food donation
- Verified NGO/food bank integration with geolocation
- Personal carbon footprint analytics

Built as a final-year capstone project at **Chitkara University, Rajpura, Punjab**, under the mentorship of **Dr. Preeti Saini**.

---

## Features

### 🏠 Household Inventory Management
- Add items manually or from a curated catalog of 55+ common items across 9 categories
- Real-time expiry classification into four tiers: **Fresh**, **Warning**, **Critical**, **Expired**
- Colour-coded urgency badges and ticker for items expiring soon
- Inventory health ring showing overall household freshness as a live percentage

### 🤝 Community Donation Board
- List near-expiry food items for community pickup
- Other users can claim listed items with a single click
- Items display urgency, location, and donor information

### 🏢 NGO & Food Bank Finder
- Geolocation-based detection of nearby NGOs
- Directory of 30+ verified food banks across 8 Indian cities (Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Kolkata, Pan-India)
- One-click Google Maps directions integration

### 🌿 Carbon Footprint Tracker *(New)*
- Quantifies personal CO₂ savings based on real donation data
- Dashboard mini-widget always visible after login
- Full analytics gauge with animated SVG needle
- EPA-cited calculation methodology:
  - `CO₂ saved = kg donated × 2.5 kg CO₂/kg`
  - `Car km avoided = CO₂ saved ÷ 0.21 kg CO₂/km`
  - `Meals enabled = kg donated ÷ 0.5 kg per meal`

### 📊 Impact Analytics Dashboard *(New)*
- **Inventory Status Donut** — Fresh / Warning / Critical / Expired proportions
- **Category Bar Chart** — Item distribution across food categories
- **8-Week Trend Area Chart** — Items added, donated, and expired over time
- **Waste Rate Circular Meter** — Green / Amber / Red contextual label

### 🔐 Authentication
- JWT-based stateless authentication via secure httpOnly cookies
- Bcrypt password hashing
- Protected routes on both frontend and backend

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | React.js | 18.3.1 |
| State Management | Redux Toolkit | 2.2.7 |
| Routing | React Router DOM | 6.26.1 |
| Styling | Tailwind CSS | 3.4.10 |
| Build Tool | Vite | 5.4.11 |
| HTTP Client | Axios | 1.7.7 |
| Charts | Recharts | 2.x |
| Backend Runtime | Node.js | 20.x LTS |
| Web Framework | Express.js | 4.21.2 |
| Database | MongoDB | 7.x |
| ODM | Mongoose | 8.17.0 |
| Authentication | JWT | 9.0.2 |
| Password Hashing | bcrypt | 6.0.0 |
| Geolocation | Browser Geolocation API | Native |

---

## Project Structure

```
arrivio/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route-level page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── AddItem.jsx
│   │   │   ├── Donate.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── NGOFinder.jsx
│   │   ├── store/              # Redux store and slices
│   │   ├── utils/              # Helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                    # Frontend environment variables
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Node.js + Express backend
│   ├── controllers/            # Route handler logic
│   ├── middleware/             # Auth middleware, error handlers
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Item.js
│   │   └── Donation.js
│   ├── routes/                 # API route definitions
│   │   ├── auth.routes.js
│   │   ├── inventory.routes.js
│   │   ├── donation.routes.js
│   │   └── analytics.routes.js
│   ├── data/                   # Static datasets (NGO directory, item catalog)
│   ├── .env                    # Backend environment variables
│   └── index.js                # Entry point
│
└── README.md
```

> ⚠️ Folder names may vary slightly depending on your actual implementation. Adjust paths accordingly.

---

## Prerequisites

Before running the project, ensure you have the following installed on your system:

| Tool | Version | Download |
|---|---|---|
| **Node.js** | v20.x LTS or higher | [nodejs.org](https://nodejs.org/) |
| **npm** | v9.x or higher (bundled with Node.js) | — |
| **MongoDB** | v7.x (local) OR a free MongoDB Atlas account | [mongodb.com](https://www.mongodb.com/) |
| **Git** | Any recent version | [git-scm.com](https://git-scm.com/) |

To verify your installations, run:

```bash
node -v       # Should output v20.x.x
npm -v        # Should output 9.x.x or higher
mongod --version   # If using local MongoDB
git --version
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/arrivio.git
cd arrivio
```

> Replace `YOUR_USERNAME` with your actual GitHub username.

---

### 2. Backend Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

---

### 3. Frontend Setup

In a new terminal, navigate to the client directory and install dependencies:

```bash
cd client
npm install
```

---

### 4. Environment Variables

#### Backend — `server/.env`

Create a `.env` file inside the `server/` folder:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/arrivio
# OR use MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/arrivio?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Cookie Configuration
COOKIE_EXPIRES_IN=7
```

> **MongoDB Atlas (Recommended for deployment):**
> 1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account
> 2. Create a new cluster → Connect → Get connection string
> 3. Replace `MONGO_URI` with your Atlas connection string

#### Frontend — `client/.env`

Create a `.env` file inside the `client/` folder:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

### 5. Running the Application

#### Option A — Run Backend and Frontend Separately (Recommended for Development)

**Terminal 1 — Start the Backend:**

```bash
cd server
npm run dev
```

The backend server will start at: `http://localhost:5000`

**Terminal 2 — Start the Frontend:**

```bash
cd client
npm run dev
```

The frontend will start at: `http://localhost:5173`

Open your browser and navigate to **[http://localhost:5173](http://localhost:5173)**

---

#### Option B — Run with Local MongoDB

If you prefer to use a local MongoDB instance instead of Atlas:

1. Start MongoDB service:

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Ubuntu / Debian
sudo systemctl start mongod

# Windows
net start MongoDB
```

2. Confirm MongoDB is running:

```bash
mongosh
```

3. Then follow Option A above.

---

## Available Scripts

### Backend (`server/`)

| Command | Description |
|---|---|
| `npm run dev` | Starts the development server with nodemon (auto-restart on changes) |
| `npm start` | Starts the production server |

### Frontend (`client/`)

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Builds the app for production |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs ESLint for code quality checks |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT cookie |
| `POST` | `/api/auth/logout` | Logout and clear cookie |
| `GET` | `/api/auth/me` | Get currently authenticated user |

### Inventory
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/items` | Get all items for the logged-in user |
| `POST` | `/api/items` | Add a new item |
| `PUT` | `/api/items/:id` | Update an item |
| `DELETE` | `/api/items/:id` | Delete an item |

### Donations
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/donations` | Get all available community donations |
| `POST` | `/api/donations` | List an item for donation |
| `PUT` | `/api/donations/:id/claim` | Claim a donation |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics` | Get inventory stats, waste trends, and CO₂ data for the user |

---

## Screenshots

| Dashboard | Inventory |
|---|---|
|<img width="1130" height="707" alt="image" src="https://github.com/user-attachments/assets/8f15b691-df96-4de4-89bc-7d3dd3689d19" />|<img width="1122" height="637" alt="image" src="https://github.com/user-attachments/assets/38ffe04a-13b0-4c41-9059-1c3fedfb1a01" />|

| Donate & Community Board | NGO Finder |
|---|---|
| ![Donate](./screenshots/donate.png) | ![NGO](./screenshots/ngo.png) |

| Impact Analytics | Carbon Footprint Tracker |
|---|---|
| ![Analytics](./screenshots/analytics.png) | ![Carbon](./screenshots/carbon.png) |

> ⚠️ Add your actual screenshots to a `/screenshots` folder in the root of the project.

---

## Research & References

This project is backed by peer-reviewed research on food waste behaviour and technology intervention:

1. Parfitt, J., Barthel, M., & Macnaughton, S. (2010). *Food waste within food supply chains.* Philosophical Transactions of the Royal Society B.
2. Schanes, K., Dobernig, K., & Gözet, B. (2018). *Food waste matters.* Journal of Cleaner Production.
3. Aschemann-Witzel, J. et al. (2015). *Consumer-related food waste.* Sustainability.
4. FAO. (2023). *The State of Food and Agriculture 2023.*
5. IPCC. (2022). *Climate Change 2022: Mitigation of Climate Change.*
6. EPA. (2023). *Greenhouse Gas Equivalencies Calculator.*
7. ASSOCHAM. (2022). *Food Waste in India: Causes, Consequences and Solutions.*

---

## Future Roadmap

| Priority | Feature |
|---|---|
| 🔴 High | Barcode scanning for automatic item entry |
| 🔴 High | Mobile app (React Native) with push notifications |
| 🟡 Medium | AI-powered shopping planner based on purchase history |
| 🟡 Medium | ML-based smart expiry prediction |
| 🟡 Medium | Multi-language support (Hindi, Tamil, Telugu) |
| 🟡 Medium | SMS alert system for users without internet access |
| 🟢 Low | Expanded NGO database (100+ Indian cities) |
| 🟢 Low | Gamification: badges, leaderboards, challenges |
| 🟢 Low | FSSAI government API integration for real-time shelf-life data |

---

## Authors

| Name | Role | Contact |
|---|---|---|
| **Lavanya Kapoor** | Developer (Roll No: 2210991850) | lavanya1850.be22@chitkara.edu.in |
| **Dr. Preeti Saini** | Project Mentor | preeti.saini@chitkara.edu.in |

**Institution:** Chitkara University, Rajpura, Punjab

---

## License

This project was submitted for copyright registration under the title **"Arrivio"** at Chitkara University. All rights reserved by the authors.

---

<div align="center">
  <p>Made with 💚 to fight food waste — one household at a time.</p>
  <p><i>"Approximately 1.3 billion tonnes of food is wasted globally every year. Arrivio is our answer."</i></p>
</div>
