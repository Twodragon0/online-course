#!/bin/bash

# 환경 변수 로드
set -a
source .env
set +a

# Vercel 대시보드 > Settings > Environment Variables에 추가
DATABASE_URL="postgresql://username:password@host:port/database"

echo "Installing dependencies..."
npm install

echo "Generating Prisma Client..."
npx prisma generate

echo "Running database migrations..."
npx prisma migrate deploy

echo "Building the application..."
npm run build

echo "Deploying to Vercel..."
vercel deploy --prod

echo "Deployment completed!"