#!/bin/bash

# || ॐ श्री गणेशाय नमः ||
# AITDL v2 — Deploy Script

echo "🚀 Starting Deployment Process..."

# 1. Run Migrations
echo "📦 Running Database Migrations..."
python scripts/migrate.py

# 2. Run Tests
echo "🧪 Running Tests..."
python -m pytest backend/tests/ -v

if [ $? -eq 0 ]; then
    echo "✅ Tests passed. Proceeding to deploy..."
    
    # Check for Railway CLI
    if command -v railway &> /dev/null
    then
        echo "🚄 Deploying Backend to Railway..."
        railway up --detach
    else
        echo "⚠️ Railway CLI not found. Please deploy manually or via GitHub Actions."
    fi

    # Check for Vercel CLI
    if command -v vercel &> /dev/null
    then
        echo "🔼 Deploying Frontend to Vercel..."
        cd frontend && vercel --prod
    else
        echo "⚠️ Vercel CLI not found. Please deploy manually or via GitHub Actions."
    fi
    
    echo "🎉 Deployment initiated!"
else
    echo "❌ Tests failed. Deployment aborted."
    exit 1
fi
