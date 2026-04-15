# Gossip API

A Twitter-like social media REST API built with Node.js, TypeScript, Express, and PostgreSQL. Features user authentication, posts, followers, and likes functionality.

## Technology Stack

### Backend Framework
- **Node.js** with **TypeScript** (ES modules)
- **Express.js** - Web application framework

### Database
- **PostgreSQL** - Relational database
- **Kysely** - Type-safe SQL query builder

## Project Structure

```
src/
├── index.ts                    # Server entry point
├── types.ts                    # Auto-generated database types
├── config/
│   ├── routes.ts              # Route registration
│   ├── passport.ts            # Passport.js configuration
│   └── session.ts             # Session configuration
├── controllers/
│   ├── auth.ts                # Authentication endpoints
│   ├── posts.ts               # Post CRUD operations
│   ├── followers.ts           # Follower management
│   └── likes.ts               # Like functionality
├── middleware/
│   ├── auth.ts                # Authentication middleware
│   └── errorHandler.ts        # Global error handling
├── database/
│   ├── database.ts            # Kysely DB instance
│   ├── initialize.ts          # Database initialization
│   └── migrations/            # Database migrations
└── utils/
    ├── AppError.ts            # Custom error class
    └── asyncHandler.ts        # Async route wrapper
```
## Database Diagram

<img width="1359" height="512" alt="Untitled" src="https://github.com/user-attachments/assets/f5d53b02-1e3d-4e99-9069-7110e522d4e0" />


## Authentication System

### Method
Session-based authentication using **Passport.js Local Strategy**.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd gossip-api
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file based on `.env.example`
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=gossip_api
API_PORT=3001
SESSION_SECRET=your_session_secret_here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

4. Initialize the database and run migrations
```bash
./initialize_db.sh
```

5. Generate TypeScript types from database schema
```bash
npm run generate_types
```

### Development

Start the development server with hot reload:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Production

Start the production server:
```bash
npm start
```

### Available Scripts

- `npm start` - Run the server in production mode
- `npm run dev` - Run the server in development mode with hot reload
- `npm run prettier:write` - Format all code with Prettier
- `npm run lint` - Lint code with ESLint
- `npm run generate_types` - Generate TypeScript types from database schema

## License

This project is licensed under the ISC License.
