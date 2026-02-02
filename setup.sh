#!/bin/bash

# DevRead.me Quick Start Script
# Automatisiertes Setup für Development & Production

set -e

echo "🚀 DevRead.me Quick Start Setup"
echo "================================"
echo ""

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Hilfsfunktion
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check Node.js
echo -e "${BLUE}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js 18+ from https://nodejs.org"
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18+ required. Current version: $(node -v)"
fi
print_status "Node.js $(node -v) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm not found"
fi
print_status "npm $(npm -v) detected"

# Check if in devreadme directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the devreadme directory?"
fi

echo ""

# Setup menu
echo -e "${BLUE}Select setup type:${NC}"
echo "1) Development Setup (npm install + dev server)"
echo "2) Production Build (npm install + build)"
echo "3) Docker Build (requires Docker)"
echo "4) Clean Install (remove node_modules + install)"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        print_info "Setting up for development..."
        ;;
    2)
        print_info "Setting up for production..."
        ;;
    3)
        if ! command -v docker &> /dev/null; then
            print_error "Docker not found. Install from https://docker.com"
        fi
        print_info "Setting up Docker..."
        ;;
    4)
        print_info "Performing clean install..."
        rm -rf node_modules package-lock.json
        ;;
    *)
        print_error "Invalid choice"
        ;;
esac

echo ""

# Check .env.local
if [ ! -f ".env.local" ]; then
    if [ -f ".env.local.example" ]; then
        print_warning ".env.local not found. Creating from template..."
        cp .env.local.example .env.local
        print_warning "Please edit .env.local and add your GROQ_API_KEY"
        read -p "Press Enter once you've updated .env.local... "
    else
        print_error ".env.local.example not found"
    fi
else
    if grep -q "your_groq_api_key_here" .env.local; then
        print_warning "GROQ_API_KEY still set to placeholder in .env.local"
        read -p "Please update it and press Enter... "
    fi
fi

# Validate GROQ_API_KEY
if ! grep -q "^GROQ_API_KEY=" .env.local || grep -q "your_groq_api_key_here" .env.local; then
    print_error "GROQ_API_KEY not configured in .env.local"
fi
print_status "GROQ_API_KEY configured"

echo ""
print_info "Installing dependencies..."
npm install
print_status "Dependencies installed"

echo ""

# Execute chosen setup
case $choice in
    1)
        echo -e "${GREEN}Development Setup Complete!${NC}"
        echo ""
        print_info "Starting development server..."
        echo ""
        npm run dev
        ;;
    2)
        echo -e "${GREEN}Building for production...${NC}"
        npm run build
        echo ""
        echo -e "${GREEN}Production Build Complete!${NC}"
        echo ""
        print_info "To start the production server, run:"
        echo "  npm start"
        ;;
    3)
        echo -e "${GREEN}Building Docker image...${NC}"
        docker build -t devreadme:latest .
        echo ""
        print_info "Docker build complete. To run:"
        echo "  docker run -e GROQ_API_KEY='your_key' -p 3000:3000 devreadme:latest"
        ;;
    4)
        echo -e "${GREEN}Clean Install Complete!${NC}"
        echo ""
        print_info "Now run:"
        echo "  npm run dev    # for development"
        echo "  npm run build  # for production"
        ;;
esac

echo ""
print_status "Setup complete!"
echo ""
