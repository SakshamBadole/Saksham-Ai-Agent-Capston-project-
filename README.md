# SmartSeller AI — Agent-Driven E-Commerce Intelligence

SmartSeller AI is a production-ready, full-stack application that leverages collaborative AI agents (orchestrated via **LangGraph** and **Google Gemini**) and machine learning forecasting (using **Scikit-Learn** and **Pandas**) to help e-commerce sellers automate competitor price tracking, inventory demand forecasting, and strategic price optimizations.

---

## 📂 Project Architecture

```text
/smart-seller-ai
├── docker-compose.yml              # Local PostgreSQL & pgAdmin services config
├── README.md                       # Main instruction manual
├── /backend                        # FastAPI Python Backend
│   ├── requirements.txt            # Python dependencies lists
│   ├── .env.example                # Template for database & Gemini keys
│   └── /app
│       ├── main.py                 # FastAPI application entry & CORS mounts
│       ├── /core
│       │   ├── config.py           # Pydantic Settings validation
│       │   ├── database.py         # Async SQLAlchemy engine & sessions
│       │   ├── security.py         # JWT tokens & Password crypt contexts
│       │   └── seeder.py           # Database seeder script
│       ├── /models
│       │   └── models.py           # SQLAlchemy declarative database tables
│       ├── /schemas
│       │   └── schemas.py          # Pydantic input & output models
│       ├── /services
│       │   ├── forecaster.py       # Scikit-learn demand regression pipeline
│       │   └── agents.py           # LangGraph multi-agent consensus nodes
│       └── /api
│           ├── auth.py             # Login, register, and Google credentials
│           ├── products.py         # Product CRUD endpoints
│           ├── competitors.py      # Tracking and match pricing additions
│           ├── demand.py           # Predict demand endpoints
│           ├── pricing.py          # Agent decision accept/reject flows
│           ├── reports.py          # Gemini Markdown compilations
│           └── dashboard.py        # Analytics stats aggregator
│
└── /frontend                       # Vite + React.js SPA Frontend
    ├── index.html                  # HTML template with Google Fonts
    ├── package.json                # NPM packages configs
    ├── postcss.config.js           # CSS transformations config
    ├── tailwind.config.js          # Tailwind tokens & dark-theme settings
    ├── vite.config.js              # Vite server & API proxies rules
    └── /src
        ├── index.css               # Global stylesheets & glassmorphism
        ├── main.jsx                # React app mount script
        ├── App.jsx                 # Route settings & ProtectedRoute wrapper
        ├── /context
        │   └── AuthContext.jsx     # JWT sessions & login context provider
        ├── /services
        │   └── api.js              # Axios wrapper with header interceptors
        ├── /components
        │   ├── Sidebar.jsx         # Collapsible navigation & theme toggle
        │   └── Layout.jsx          # Header details & viewport layout wrapper
        └── /pages
            ├── LandingPage.jsx     # SaaS presentation & interactive simulator
            ├── LoginRegister.jsx   # Transitions forms & mock Google oauth
            ├── Dashboard.jsx       # Analytics cards, charts & agents status
            ├── CompetitorAnalysis.jsx# Tracking matrix and addition forms
            ├── DemandForecast.jsx  # 7d forecasts & confidence shaded charts
            ├── PricingStrategy.jsx # Recommendations approval & agent logs
            ├── Reports.jsx         # Document viewer & markdown compiler
            └── Settings.jsx        # Margins variables & API keys check
```

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite compile compiler)
- **Tailwind CSS** (curated theme configurations)
- **Framer Motion** (fluid animations)
- **Recharts** (responsive area, bar, and envelope charts)
- **Axios** (token-intercepting HTTP client)

### Backend
- **Python FastAPI** (async gateway)
- **PostgreSQL** (relational database storage)
- **LangGraph & LangChain** (multi-agent coordination)
- **Google Gemini API** (natural language reasoning and strategy)
- **Pandas & Scikit-learn** (mathematical sales forecasting)

---

## 🚀 Local Development Setup

### 1. Database Setup (PostgreSQL)
Ensure you have Docker installed, then run the database and pgAdmin containers from the root directory:
```bash
docker-compose up -d
```
This spawns:
- **PostgreSQL** on port `5432` (Username: `postgres`, Password: `postgrespassword`, DB: `smartseller`)
- **pgAdmin 4** on port `5050` (Email: `admin@smartseller.ai`, Password: `adminpassword`)

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Virtual Environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure configurations:
   Copy `.env.example` to `.env` and fill in your details:
   ```bash
   cp .env.example .env
   ```
   *Note: If no `GEMINI_API_KEY` is provided, the backend falls back to standard rule-based simulations, making it immediately testable.*

5. Seed database (creates tables and populates sample sales histories, competitor listings, and default credentials):
   ```bash
   python -m app.core.seeder
   ```

6. Start FastAPI dev server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   Verify local API status at `http://127.0.0.1:8000/`. OpenAPI Docs can be viewed at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start Vite local server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to: `http://localhost:5173`.

#### Default Credentials (Post-Seeding)
- **Email**: `demo@smartseller.ai`
- **Password**: `demopassword`

---

## 🗄️ Database Schema Reference

- **`users`**: Manages merchant authentication data, credentials, password hashes, roles, and Google OAuth associations.
- **`products`**: Central product catalog listing current prices, unit costs, remaining inventory, categories, and identifiers.
- **`competitor_products`**: Tracks monitored competitor URLs, real-time prices, stock status, and seller ratings.
- **`sales_history`**: Holds trailing daily sales details (quantities sold, daily revenue, average sell price) used to train the Scikit-learn regressors.
- **`price_recommendations`**: AI suggestions containing calculated target pricing, reasoning logs, confidence indexes, and implementation status (`pending`, `applied`, `rejected`).
- **`demand_forecasts`**: Daily demand quantities forecasted for the next 7 days, complete with lower and upper confidence margins.
- **`reports`**: Business intelligence summaries composed in Markdown containing executive pricing updates and reordering advisories.

---

## 📦 Production Deployment Guide

### Frontend Compilation
1. Navigate to the `/frontend` directory.
2. Build static production files:
   ```bash
   npm run build
   ```
   This generates a optimized compilation folder `/frontend/dist`.
3. Serve these static files using **Nginx** or host on CDN services (Vercel, Netlify, AWS S3).
   Example Nginx rule block:
   ```nginx
   server {
       listen 80;
       server_name app.smartseller.ai;
       root /var/www/smartseller/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Backend Production Setup
1. Host the FastAPI service on a Linux VPS (AWS EC2, DigitalOcean, Heroku) or containerize.
2. Run using a production WSGI/ASGI server like Gunicorn with Uvicorn workers to handle concurrency:
   ```bash
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
   ```
3. Secure using an SSL certificate (Let's Encrypt).
4. Connect to an enterprise-grade cloud database instance (AWS RDS PostgreSQL, Supabase) and update the `DATABASE_URL` connection strings in environment variables.
