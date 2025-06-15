# Barelle Distribution - E-commerce Platform

## Overview

This is a B2B e-commerce platform for Barelle Distribution, specializing in Ivorian products including spiritueux (spirits), natural juices, cigars, and accessories. The application is built as a full-stack web application with a React frontend and Express.js backend, featuring Replit authentication for B2B user management and a comprehensive shopping cart system.

## System Architecture

The application follows a monorepo structure with clear separation between frontend and backend:

- **Frontend**: React with TypeScript, using Vite for development and building
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect for B2B user management
- **UI Framework**: Tailwind CSS with shadcn/ui components for consistent design
- **Deployment**: Configured for Replit's autoscale deployment

## Key Components

### Frontend Architecture (`client/`)
- **React Router**: Using Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Components**: Custom components built on top of shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom Ivorian-themed color palette
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture (`server/`)
- **Express Server**: RESTful API with middleware for logging and error handling
- **Database Layer**: Drizzle ORM with connection pooling via Neon serverless
- **Authentication**: Passport.js with OpenID Connect strategy for Replit Auth
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **Storage Layer**: Abstracted storage interface for data operations

### Database Schema (`shared/schema.ts`)
- **Users**: B2B user profiles with company information and authentication data
- **Products**: Product catalog with categories, pricing, and inventory
- **Categories**: Product categorization system
- **Cart**: Session-based shopping cart with user association
- **Orders**: Order management for B2C and B2B transactions
- **Sessions**: Authentication session storage

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth, creating B2B profiles with company information
2. **Product Browsing**: Products are fetched from PostgreSQL and cached client-side with TanStack Query
3. **Shopping Cart**: Cart items are stored in database with session/user association
4. **Checkout Process**: B2C orders can be placed by anonymous users, B2B orders require authentication
5. **Order Management**: Orders are stored with detailed item information and customer data

## External Dependencies

### Authentication & Infrastructure
- **Replit Auth**: OpenID Connect provider for user authentication
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit Deployment**: Autoscale deployment platform

### Key Libraries
- **Database**: Drizzle ORM, @neondatabase/serverless
- **Authentication**: Passport.js, openid-client
- **Frontend**: React, TanStack Query, Wouter
- **UI**: Radix UI primitives, Tailwind CSS
- **Forms**: React Hook Form, Zod validation
- **Development**: Vite, TypeScript, ESBuild

## Deployment Strategy

The application is configured for Replit's deployment platform with:

- **Development**: `npm run dev` starts the Express server with Vite middleware
- **Build Process**: Vite builds the client, ESBuild bundles the server
- **Production**: Single Node.js process serving both API and static files
- **Database**: Automatic connection to provisioned PostgreSQL instance
- **Environment**: Configured for Replit's autoscale infrastructure

The deployment uses a parallel workflow strategy where the application serves both the React frontend and Express API from a single process, with static files served from the built client distribution.

## Changelog

```
Changelog:
- June 15, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```