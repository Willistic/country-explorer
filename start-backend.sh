#!/bin/bash

echo "🚀 Starting Country Explorer Backend..."

# Check if MongoDB is already running
if ! pgrep -f mongod > /dev/null; then
    echo "📦 Starting MongoDB..."
    mkdir -p /tmp/mongodb-data
    mongod --port 27017 --dbpath /tmp/mongodb-data > /tmp/mongodb.log 2>&1 &
    sleep 3
    echo "✅ MongoDB started"
else
    echo "✅ MongoDB already running"
fi

# Start the backend server
echo "🔧 Starting Backend API..."
cd /Users/will/Documents/FullStack/fetching-data/personal-project/backend
npm run dev

echo "🎉 Backend is ready!"
echo "🌍 Health check: http://localhost:5001/health"
echo "📚 API: http://localhost:5001/api/v1/countries"