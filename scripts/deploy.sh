#!/bin/bash

# Meditrack System Deployment Script
# This script handles the complete deployment of the Meditrack healthcare management system

set -e  # Exit on any error

echo "🏥 Meditrack System Deployment Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env() {
    print_status "Checking environment configuration..."
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        if [ -f env.example ]; then
            cp env.example .env
            print_success "Created .env file from template"
            print_warning "Please review and update .env file with your settings before continuing"
        else
            print_error "env.example file not found. Cannot create .env file."
            exit 1
        fi
    else
        print_success "Environment configuration found"
    fi
}

# Stop existing containers
stop_containers() {
    print_status "Stopping existing containers..."
    docker-compose down --remove-orphans 2>/dev/null || true
    print_success "Existing containers stopped"
}

# Build and start containers
start_containers() {
    print_status "Building and starting containers..."
    docker-compose up -d --build
    print_success "Containers started successfully"
}

# Wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to be healthy..."
    
    # Wait for database
    print_status "Waiting for database to be ready..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T database mysqladmin ping -h localhost --silent; then
            print_success "Database is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Database failed to start within 60 seconds"
        exit 1
    fi
    
    # Wait for backend
    print_status "Waiting for backend API to be ready..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:3001/health &>/dev/null; then
            print_success "Backend API is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Backend API failed to start within 60 seconds"
        exit 1
    fi
    
    # Wait for frontend
    print_status "Waiting for frontend to be ready..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:3000/health &>/dev/null; then
            print_success "Frontend is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Frontend failed to start within 60 seconds"
        exit 1
    fi
}

# Run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    # Check database
    if docker-compose exec -T database mysqladmin ping -h localhost --silent; then
        print_success "Database health check passed"
    else
        print_error "Database health check failed"
        exit 1
    fi
    
    # Check backend API
    if curl -f http://localhost:3001/health &>/dev/null; then
        print_success "Backend API health check passed"
    else
        print_error "Backend API health check failed"
        exit 1
    fi
    
    # Check frontend
    if curl -f http://localhost:3000/health &>/dev/null; then
        print_success "Frontend health check passed"
    else
        print_error "Frontend health check failed"
        exit 1
    fi
}

# Display deployment information
show_deployment_info() {
    echo ""
    echo "🎉 Meditrack System Deployment Complete!"
    echo "========================================="
    echo ""
    echo "📱 Application URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:3001"
    echo "   Database: localhost:3306"
    echo ""
    echo "👥 Default Login Credentials:"
    echo "   Doctor: dr.smith@medcare.com / password123"
    echo "   Patient: patient1@example.com / password123"
    echo ""
    echo "🔧 Management Commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo "   Restart: docker-compose restart"
    echo ""
    echo "📊 Health Check URLs:"
    echo "   Frontend: http://localhost:3000/health"
    echo "   Backend: http://localhost:3001/health"
    echo ""
}

# Main deployment function
main() {
    echo "Starting Meditrack System deployment..."
    echo ""
    
    check_docker
    check_env
    stop_containers
    start_containers
    wait_for_services
    run_health_checks
    show_deployment_info
    
    print_success "Deployment completed successfully! 🎉"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "stop")
        print_status "Stopping Meditrack System..."
        docker-compose down
        print_success "Meditrack System stopped"
        ;;
    "restart")
        print_status "Restarting Meditrack System..."
        docker-compose restart
        print_success "Meditrack System restarted"
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "status")
        docker-compose ps
        ;;
    "health")
        run_health_checks
        ;;
    *)
        echo "Usage: $0 {deploy|stop|restart|logs|status|health}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Deploy the complete Meditrack system (default)"
        echo "  stop    - Stop all services"
        echo "  restart - Restart all services"
        echo "  logs    - View service logs"
        echo "  status  - Show service status"
        echo "  health  - Run health checks"
        exit 1
        ;;
esac

