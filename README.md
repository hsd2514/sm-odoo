# StockMaster 📦🚀

**The Hybrid Professional Neo-Brutalist Inventory Management System**

StockMaster is a modern, high-performance Inventory Management System (IMS) designed for the "Odoo Hackathon". It combines a robust **FastAPI** backend with a dynamic **React** frontend, styled with a unique "Hybrid Professional Neo-Brutalist" aesthetic that blends tactile, high-contrast design with professional usability.

---

## 🌟 Key Features

### 🏭 Core Inventory
-   **Multi-Warehouse Support**: Manage stock across multiple locations (e.g., Main Warehouse, Secondary Warehouse).
-   **Real-Time Tracking**: Instant updates on stock levels as operations are performed.
-   **Product Management**: Create, edit, and track products with SKUs, categories, and pricing.

### 🚚 Operations (The Heart of StockMaster)
-   **Receipts (IN)**: Process incoming shipments from vendors.
-   **Deliveries (OUT)**: Manage outbound orders to customers.
-   **Internal Transfers (INT)**: Seamlessly move stock between warehouses.
-   **Adjustments (ADJ)**: Correct stock discrepancies with audit trails.
-   **Smart Validation**: Prevents negative stock and ensures data integrity during moves.

### 📊 Dashboard & Analytics
-   **Live KPIs**: Instant view of Total Products, Low Stock Alerts, and Pending Operations.
-   **Visual Charts**: Interactive bar and pie charts for stock distribution and movement trends.
-   **Recent Activity**: Real-time feed of the latest stock moves.

### 🎨 UI/UX Design
-   **Hybrid Neo-Brutalism**: A distinct design language featuring bold borders, hard shadows, and high contrast, balanced with professional spacing and typography (Inter font).
-   **Responsive Layout**: Fully functional on desktop and mobile devices with a collapsible sidebar.
-   **Tactile Interactions**: Buttons and cards have "physical" press effects for a satisfying user experience.

---

## 🛠️ Tech Stack

### Backend
-   **Language**: Python 3.12+
-   **Framework**: **FastAPI** (High performance, easy to use)
-   **Package Manager**: **uv** (Blazing fast Python package installer)
-   **Database**: **PostgreSQL**
-   **ORM**: **SQLModel** (Combines Pydantic & SQLAlchemy)
-   **Authentication**: JWT (JSON Web Tokens) with **Argon2** password hashing.

### Frontend
-   **Framework**: **React 18** (Vite)
-   **Styling**: **Tailwind CSS v4**
-   **Icons**: Lucide React
-   **State Management**: React Hooks & Context API
-   **HTTP Client**: Axios

---

## 🚀 Getting Started

### Prerequisites
-   **Python 3.10+**
-   **Node.js 18+**
-   **PostgreSQL** (Local or Cloud)

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment and install dependencies
# We recommend using 'uv' for speed, but pip works too
pip install -r requirements.txt

# Configure Environment Variables
# Create a .env file in /backend
cp env.template .env
# Edit .env with your PostgreSQL credentials:
# DATABASE_URL=postgresql://user:password@localhost/stockmaster

# Run the Server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
API Documentation (Swagger UI): `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run the Development Server
npm run dev
```

The application will be available at `http://localhost:5173`.

### 3. Initial Data Seeding (Optional but Recommended)

We have a seed script to populate the database with initial users, warehouses, and products.

```bash
cd backend
python seed.py
```

---

## 🔑 Login Credentials

After seeding, use the following admin credentials to log in:

-   **Email**: `harshdange25@gmail.com`
-   **Password**: `admin`

---

## 📂 Project Structure

```
sm/
├── backend/
│   ├── app/
│   │   ├── api/            # API Routes (auth, products, operations)
│   │   ├── core/           # Config and Security
│   │   ├── models/         # SQLModel Database Models
│   │   └── main.py         # App Entry Point
│   ├── seed.py             # Data Seeding Script
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI Components (Cards, Buttons, Inputs)
│   │   ├── pages/          # Main Pages (Dashboard, Operations, Login)
│   │   ├── hooks/          # Custom React Hooks
│   │   └── index.css       # Global Styles & Tailwind Directives
│   └── ...
└── README.md
```

---

## 💡 Design Philosophy

We moved away from the standard "Corporate SaaS" look to something with more character. The **Hybrid Neo-Brutalist** style uses:
-   **Hard Shadows**: `box-shadow: 4px 4px 0px 0px #000;`
-   **Bold Borders**: `border: 2px solid #000;`
-   **Vibrant Colors**: Indigo, Emerald, and Amber accents against a clean background.

This design isn't just for looks—the high contrast improves readability and the distinct boundaries make the UI easier to scan in high-pressure warehouse environments.

---

**Built with ❤️ for the Hackathon.**
