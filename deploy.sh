#!/bin/bash
set -e

echo "Pulling latest code..."
git pull origin dev

echo "Installing dependencies..."
npm install

echo "Building..."
npm run build

echo "Restarting PM2..."
pm2 restart felbo-admin

echo "Deployment competed"