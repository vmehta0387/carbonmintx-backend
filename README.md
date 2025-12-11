# Carbon Exchange Backend

Blockchain-based carbon credit platform backend built with NestJS, PostgreSQL, and Polygon.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start PostgreSQL:
```bash
docker-compose up -d
```

3. Configure environment variables in `.env`

4. Generate Prisma client and run migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Start the server:
```bash
npm run start:dev
```

## API Endpoints

### Auth
- POST `/auth/login-wallet` - Wallet signature login
- GET `/auth/me` - Get current user

### Users
- GET `/users/profile` - Get user profile
- PATCH `/users/role` - Update user role

### Projects
- POST `/projects/create` - Create project (PROJECT_OWNER)
- POST `/projects/:id/documents` - Upload documents
- GET `/projects/:id` - Get project details
- GET `/projects` - Get all projects

### Validation
- POST `/validation/:projectId/approve` - Approve project (VALIDATOR/ADMIN)
- POST `/validation/:projectId/reject` - Reject project (VALIDATOR/ADMIN)

### Marketplace
- POST `/marketplace/list` - Create listing
- GET `/marketplace/listings` - Get active listings
- POST `/marketplace/buy` - Buy carbon credits

## Tech Stack

- NestJS
- PostgreSQL + Prisma
- Viem (Polygon blockchain)
- JWT Authentication
- PDFKit (Certificates)
