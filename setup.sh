#!/bin/bash

# 🚀 Full-Stack Country Explorer - Quick Setup Script

echo "🌍 Setting up Full-Stack Country Explorer..."
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_warning "Node.js version $NODE_VERSION detected. Recommended: Node.js 18+"
fi

print_status "Node.js version: $(node -v)"
print_status "npm version: $(npm -v)"

# Install frontend dependencies
print_status "Installing frontend dependencies..."
if npm install; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
if npm install; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Go back to root
cd ..

# Install concurrently if not already installed
print_status "Installing development tools..."
if npm install concurrently --save-dev; then
    print_success "Development tools installed"
fi

# Create environment files if they don't exist
if [ ! -f ".env" ]; then
    print_status "Creating frontend .env file..."
    cat > .env << EOF
# API Configuration
VITE_API_URL=http://localhost:5000/api/v1

# App Configuration
VITE_APP_NAME=Country Explorer
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_AUTH=true
VITE_ENABLE_FAVORITES=true
EOF
    print_success "Frontend .env file created"
else
    print_warning "Frontend .env file already exists"
fi

if [ ! -f "backend/.env" ]; then
    print_status "Creating backend .env file..."
    cat > backend/.env << EOF
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/country-explorer

# Frontend Configuration
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "your-super-secret-jwt-key-change-this-in-production")
JWT_EXPIRE=7d

# External API Configuration
COUNTRIES_API_URL=https://restcountries.com/v3.1

# Cache Configuration
CACHE_TTL=3600
EOF
    print_success "Backend .env file created with random JWT secret"
else
    print_warning "Backend .env file already exists"
fi

# Check if MongoDB is running
print_status "Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.runCommand('ping').ok" --quiet 2>/dev/null; then
        print_success "MongoDB is running and accessible"
    else
        print_warning "MongoDB is not running. Please start MongoDB before running the app."
        print_status "To start MongoDB:"
        print_status "  - macOS: brew services start mongodb-community"
        print_status "  - Linux: sudo systemctl start mongod"
        print_status "  - Windows: net start MongoDB"
    fi
elif command -v mongo &> /dev/null; then
    if mongo --eval "db.runCommand('ping').ok" --quiet 2>/dev/null; then
        print_success "MongoDB is running and accessible"
    else
        print_warning "MongoDB is not running. Please start MongoDB before running the app."
    fi
else
    print_warning "MongoDB CLI not found. Please ensure MongoDB is installed and running."
    print_status "Alternative: Use MongoDB Atlas (cloud) by updating MONGODB_URI in backend/.env"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
print_success "Frontend dependencies installed"
print_success "Backend dependencies installed" 
print_success "Environment files configured"
print_success "Development tools ready"

echo ""
echo "🚀 Next Steps:"
echo "=============="
echo "1. Start MongoDB (if not already running)"
echo "2. Run the development servers:"
echo "   ${GREEN}npm run dev${NC}"
echo ""
echo "3. Open your browser:"
echo "   - Frontend: ${BLUE}http://localhost:5173${NC}"
echo "   - Backend API: ${BLUE}http://localhost:5000/api/v1${NC}"
echo "   - Health Check: ${BLUE}http://localhost:5000/health${NC}"
echo ""
echo "📚 For detailed setup instructions, see: FULLSTACK_SETUP.md"
echo ""
print_status "Happy coding! 🎯"