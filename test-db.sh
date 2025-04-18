#!/bin/bash

echo "Testing database connection..."
npx prisma db push --preview-feature

echo "Generating Prisma Client..."
npx prisma generate

echo "Running database migrations..."
npx prisma migrate deploy