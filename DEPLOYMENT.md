# CarbonMintX Backend Deployment Guide

## Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Blockchain
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your-deployer-private-key
REGISTRY_CONTRACT_ADDRESS=0x4c43fBb8FFeA5A3290484f1880fDc559A8669dD6
MARKETPLACE_CONTRACT_ADDRESS=0xA05E6Bc69A2a3ce80A60CE0D1fd39C4D53640782

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Node Environment
NODE_ENV=production
PORT=3000
```

## Railway Deployment

1. Push code to GitHub repository
2. Connect Railway to your GitHub repo
3. Set environment variables in Railway dashboard
4. Deploy automatically triggers

## Render Deployment

1. Connect Render to your GitHub repo
2. Set build command: `npm run deploy:build`
3. Set start command: `npm run deploy:migrate && npm run start:prod`
4. Set environment variables
5. Deploy

## Manual Deployment Steps

1. Clone repository
2. Install dependencies: `npm install`
3. Set environment variables
4. Generate Prisma client: `npm run prisma:generate`
5. Run migrations: `npm run deploy:migrate`
6. Build application: `npm run build`
7. Start production server: `npm run start:prod`

## Database Migration

The deployment automatically runs `prisma migrate deploy` which applies all pending migrations to the production database.

## File Uploads

In production, consider using cloud storage (AWS S3, Cloudinary) instead of local file storage for the uploads directory.