# AMS (Audit Management System)

## Overview

AMS (Audit Management System) is a modern enterprise-grade audit management platform built using:

* FastAPI (Backend API)
* PostgreSQL (Neon Cloud Database)
* SQLAlchemy Async ORM
* Alembic Migration
* JWT Authentication
* React/Next.js (Frontend - Planned)
* Docker + Nginx Deployment
* Enterprise RBAC (Planned)

The project follows Clean Architecture and Repository Pattern with reusable components.

---

# Technology Stack

## Backend

* Python 3.11.x
* FastAPI
* SQLAlchemy 2.x Async
* AsyncPG
* Alembic
* Pydantic v2
* Passlib (bcrypt)
* Python-JOSE (JWT)

## Database

* PostgreSQL
* Neon Cloud

## Future

* Redis
* Celery
* Docker
* Nginx
* React/Next.js
* Enterprise RBAC

---

# Project Structure

```
AMS/
│
├── README.md
├── .env.example
│
├── backend/
│   ├── app/
│   │    ├── api/
│   │    ├── core/
│   │    ├── db/
│   │    ├── middleware/
│   │    ├── models/
│   │    ├── repositories/
│   │    ├── schemas/
│   │    ├── services/
│   │    └── utils/
│   │
│   ├── alembic/
│   ├── scripts/
│   ├── .env
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
├── docker/
├── nginx/
├── docs/
├── scripts/
└── tests/
```

---

# Development Principles

* Clean Architecture
* Repository Pattern
* Service Layer Pattern
* Dependency Injection
* Reusable Components
* Generic CRUD Services
* Enterprise Security
* Soft Delete Support
* UUID Primary Keys
* Async Database Access

No duplicate business logic should exist.

---

# Authentication

Login Standard:

```
User ID
+
Password
```

Email is NOT used for login.

Email is only used for:

* Password Recovery
* Notifications
* Profile Information

---

# JWT Authentication

The system uses:

* Access Token
* Refresh Token

Access Token:

* Short lived

Refresh Token:

* Long lived

Authentication Flow:

```
User Login
        │
        ▼
Password Verification
        │
        ▼
Generate Access Token
        │
        ▼
Generate Refresh Token
        │
        ▼
Protected APIs
```

---

# Current Implemented Features

* FastAPI Setup
* PostgreSQL Connection
* SQLAlchemy Async
* Alembic Migration
* User Table
* UserID Login
* Password Hashing
* JWT Authentication
* Refresh Token
* Protected /users/me API
* HTTPBearer Authentication

---

# Coding Standards

* Black Formatter
* Ruff Linter
* Type Hints Required
* Async Functions Preferred
* Repository Pattern
* Service Pattern
* Pydantic Schemas
* UUID IDs
* Soft Delete

---

# Database Rules

Every table should include:

* id (UUID)
* created_at
* updated_at
* is_deleted

Soft delete must be used instead of physical delete.

---

# RBAC Design (Planned)

```
User
    │
    ▼
Role
    │
    ▼
Menu Permission
    │
    ▼
Card Permission
    │
    ▼
Button Permission
```

Permissions can be granted and revoked individually.

---

# Deployment

Target VPS:

* Ubuntu
* Docker Compose
* Nginx Reverse Proxy
* Gunicorn/Uvicorn
* SSL (Let's Encrypt)

---

# Current Milestone

Completed:

* Database
* Migration
* Authentication
* Refresh Token
* Protected APIs

Next:

* Logout
* Refresh Token Rotation
* RBAC
* Company Module
* Branch Module
* Employee Module
* Audit Module
* Dashboard

---

# Development Philosophy

The AMS project emphasizes:

* Reusability
* Scalability
* Enterprise-grade Architecture
* Clean Code
* Security First
* Modular Design
* Long-term Maintainability

Every new module should reuse existing repositories, services, schemas, utilities, middleware, and common interfaces wherever possible.
