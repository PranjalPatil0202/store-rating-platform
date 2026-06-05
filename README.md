# ⭐ RateStore — Store Rating Platform

A full-stack store rating application with role-based access control.

## Tech Stack
- **Frontend**: React.js, React Router v6, Axios, react-hot-toast
- **Backend**: Node.js, Express.js, MySQL2, JWT, bcryptjs
- **Database**: MySQL 8+

## Roles
| Role | Capabilities |
|------|-------------|
| **Admin** | Full CRUD on users & stores, dashboard stats, search/filter/sort/paginate all data |
| **Normal User** | Register/login, browse stores, submit/update ratings, update password |
| **Store Owner** | View own store info, view all ratings received, update password |

## Quick Start

### 1. Database Setup
```sql
-- In MySQL client:
source database.sql
```
This creates the database, all tables, and a default admin user.

**Default Admin:** `admin@storerating.com` / `password`

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials

npm install
npm run dev
# Runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```
## Features

### Admin
- Dashboard with total users, stores and ratings
- Manage users and stores
- Search, sort and filter records

### Normal User
- Register and login
- Browse stores
- Submit and update ratings
- Change password

### Store Owner
- View store ratings
- View average store rating
- Change password

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | None | Register new user |
| POST | `/api/auth/login` | None | Login |
| GET | `/api/auth/profile` | JWT | Get profile |
| PUT | `/api/auth/password` | JWT | Update password |

### Admin
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/dashboard` | Stats |
| GET/POST | `/api/admin/users` | List / Create users |
| GET/PUT/DELETE | `/api/admin/users/:id` | View / Edit / Delete user |
| GET/POST | `/api/admin/stores` | List / Create stores |
| PUT/DELETE | `/api/admin/stores/:id` | Edit / Delete store |

### Stores (User)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/stores` | Browse stores with own rating |
| POST | `/api/stores/:id/rate` | Submit or update rating |

### Owner
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/stores/my-store` | Own store info |
| GET | `/api/stores/my-store/ratings` | Ratings received |

## Validation Rules
- **Name**: 20–60 characters
- **Email**: Valid format
- **Password**: 8–16 chars, ≥1 uppercase, ≥1 special character (`!@#$%^&*(),.?":{}|<>`)
- **Address**: Max 400 characters
- **Rating**: Integer 1–5

## Project Structure

```text
store-rating-platform/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MySQL pool
│   │   ├── controllers/          # Business logic
│   │   ├── middleware/auth.js    # JWT + RBAC
│   │   ├── routes/               # Express routers
│   │   └── validators/           # express-validator rules
│   └── .env.example
│
├── frontend/
│   └── src/
│       ├── components/common/    # Reusable UI components
│       ├── context/AuthContext   # JWT auth state
│       ├── pages/
│       │   ├── admin/            # Dashboard, Users, Stores
│       │   ├── user/             # Browse Stores, Settings
│       │   └── owner/            # Store, Ratings, Settings
│       ├── styles/               # CSS (dark theme, components)
│       └── utils/                # API client, validators
│
├── database.sql                  # Schema + seed data
├── README.md
└── .gitignore
```


## Security Features
- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens with configurable expiry
- Role-based route protection (frontend + backend)
- SQL injection prevention via parameterized queries
- Input validation on both client and server
- Cannot delete own admin account


## Screenshots

### Login Page
<img width="1492" height="798" alt="image" src="https://github.com/user-attachments/assets/6c8d2234-f405-4fed-9d03-0920458a00f7" />

### Admin Dashboard
<img width="1905" height="914" alt="image" src="https://github.com/user-attachments/assets/7d863a90-90f6-4473-810b-b350d5c22c3b" />

### User Store Listing
<img width="1904" height="914" alt="image" src="https://github.com/user-attachments/assets/76fa8583-8b07-4828-99e2-88338b4496d9" />
<img width="1908" height="911" alt="image" src="https://github.com/user-attachments/assets/a067c6e3-2a98-43e5-8f72-ca5646524216" />

### Store Owner Dashboard
<img width="1905" height="905" alt="image" src="https://github.com/user-attachments/assets/43615637-fd4e-48a8-9890-952e5ad072d0" />
<img width="1908" height="907" alt="image" src="https://github.com/user-attachments/assets/1ce7a38a-95fe-478b-b100-5b428da1c666" />

### User Dashboard 
<img width="1900" height="910" alt="image" src="https://github.com/user-attachments/assets/e10b4b87-4ea4-47f6-b56c-bc4818fe2099" />


## Author

Pranjal Patil

Full Stack Developer Intern Challenge Submission
