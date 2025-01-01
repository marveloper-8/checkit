# 🚀 Order Management System with Chat Feature

[![NestJS](https://img.shields.io/badge/NestJS-Latest-ea2845.svg)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-336791.svg)](https://www.postgresql.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-white.svg)](https://socket.io/)

A robust, enterprise-grade order management system built with NestJS, featuring real-time chat capabilities and comprehensive order tracking functionality.

## 📋 Table of Contents

- [Features](#-features)
- [Technical Stack](#-technical-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Architecture](#-architecture)
- [Security](#-security)
- [Testing](#-testing)

## ✨ Features

### 🛡️ User Management
- **Authentication & Authorization**
  - Secure role-based authentication (Admin/User)
  - JWT-based session management
  - Email/password authentication flow
  - Password hashing with bcrypt
  - Role-based access control (RBAC)

### 📦 Order Management
- **Order Processing**
  - Comprehensive order creation and tracking
  - Sophisticated status workflow (Review → Processing → Completed)
  - Detailed order specifications and metadata
  - Advanced filtering and search capabilities
  - Audit logging for all order modifications

### 💬 Real-time Chat System
- **Communication Features**
  - Order-specific chat rooms with real-time messaging
  - Persistent chat history
  - Admin-controlled chat lifecycle
  - Automatic chat summaries
  - Read receipts and typing indicators
  - File attachment support

## 🛠️ Technical Stack

### Core Technologies
- **Backend Framework**: NestJS (Latest)
- **Database**: PostgreSQL 12+
- **ORM**: Prisma
- **Real-time Communication**: Socket.io 4
- **Authentication**: JWT
- **API Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest & Supertest

### Additional Tools
- **Logging**: Winston
- **Validation**: class-validator
- **Security**: Helmet
- **Compression**: compression

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:

- [ ] Node.js (v14.x or higher)
- [ ] PostgreSQL (v12.x or higher)
- [ ] npm (v7.x or higher) or yarn (v1.22.x or higher)
- [ ] Git

## 🚀 Getting Started

### 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd order-management-system

# Install dependencies
npm install
```

### 2. Configure Environment

```bash
# Copy environment configuration
cp .env.example .env

# Configure your .env file
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-secure-secret-key"
PORT=3000
NODE_ENV="development"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed initial data (optional)
npm run seed
```

### 4. Launch Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build && npm run start:prod
```

## 📚 API Documentation

### REST Endpoints

Access the interactive Swagger documentation at `http://localhost:3000/api`

#### Core Endpoints

```plaintext
Authentication
├── POST   /auth/login         # User authentication
├── POST   /auth/register      # User registration
└── POST   /auth/refresh       # Refresh access token

Orders
├── POST   /orders            # Create order
├── GET    /orders            # List orders
├── GET    /orders/:id        # Order details
└── PATCH  /orders/:id/status # Update status

Chat
├── GET    /chat/rooms/:id          # Access chat room
├── POST   /chat/rooms/:id/messages # Send message
└── POST   /chat/rooms/:id/close    # Close chat room
```

### WebSocket Events

```plaintext
Chat Events
├── joinRoom    # Join chat room
├── leaveRoom   # Exit chat room
├── sendMessage # Send chat message
└── typing      # Typing indicator
```

## 🏗️ Architecture

### Project Structure

```plaintext
src/
├── auth/                  # Authentication module
│   ├── dto/              # Data transfer objects
│   ├── guards/           # Authentication guards
│   └── strategies/       # Auth strategies
├── users/                # User management
│   ├── dto/             # User DTOs
│   └── entities/        # User entities
├── orders/              # Order processing
│   ├── dto/            # Order DTOs
│   └── entities/       # Order entities
├── chat/               # Real-time chat
│   ├── dto/           # Chat DTOs
│   ├── events/        # WebSocket events
│   └── entities/      # Chat entities
├── common/            # Shared resources
│   ├── decorators/    # Custom decorators
│   ├── filters/       # Exception filters
│   ├── guards/        # Common guards
│   ├── interfaces/    # Shared interfaces
│   └── utils/         # Utility functions
├── config/           # Configuration
├── prisma/          # Database schema
└── main.ts          # Entry point
```

## 🔒 Security

### Implemented Measures

1. **Authentication Security**
   - JWT with appropriate expiration
   - Secure password hashing (bcrypt)
   - Rate limiting on auth endpoints
   - Refresh token rotation

2. **Data Protection**
   - Input validation & sanitization
   - SQL injection prevention
   - XSS protection
   - CORS configuration
   - Helmet security headers

3. **Access Control**
   - Role-based authorization
   - Resource-level permissions
   - Chat room access validation
   - Row-level security in database

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:e2e
```

### Development Guidelines

- Follow [Conventional Commits](https://www.conventionalcommits.org/)
- Write tests for new features
- Update documentation as needed
- Follow existing code style

---

<div align="center">
Made with ❤️ by the Joshua
</div>