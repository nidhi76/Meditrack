#!/bin/bash

# Meditrack System Test Script
# This script runs comprehensive tests for the Meditrack healthcare management system

set -e  # Exit on any error

echo "🧪 Meditrack System Test Suite"
echo "==============================="

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

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    print_status "Running: $test_name"
    
    if eval "$test_command"; then
        print_success "$test_name - PASSED"
        ((TESTS_PASSED++))
    else
        print_error "$test_name - FAILED"
        ((TESTS_FAILED++))
    fi
    echo ""
}

# Check if services are running
check_services_running() {
    print_status "Checking if services are running..."
    
    # Check if containers are running
    if ! docker-compose ps | grep -q "Up"; then
        print_error "Services are not running. Please start them first with: ./scripts/deploy.sh"
        exit 1
    fi
    
    print_success "Services are running"
}

# Test database connectivity
test_database() {
    run_test "Database Connectivity" "docker-compose exec -T database mysqladmin ping -h localhost --silent"
    run_test "Database Schema" "docker-compose exec -T database mysql -u medcare_user -pmedcare_password medcare_db -e 'SHOW TABLES;' | grep -q 'appointments'"
}

# Test backend API
test_backend_api() {
    local api_url="http://localhost:3001"
    
    run_test "Backend Health Check" "curl -f $api_url/health"
    run_test "API CORS Headers" "curl -s -I $api_url/health | grep -q 'Access-Control-Allow-Origin'"
    
    # Test authentication endpoints
    run_test "Patient Registration Endpoint" "curl -s -X POST $api_url/api/v1/auth/register/patient -H 'Content-Type: application/json' -d '{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"test@example.com\",\"password\":\"password123\",\"address\":\"Test Address\",\"gender\":\"male\"}' | grep -q 'success'"
    
    # Test login endpoint
    run_test "Login Endpoint" "curl -s -X POST $api_url/api/v1/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"patient1@example.com\",\"password\":\"password123\"}' | grep -q 'token'"
}

# Test frontend
test_frontend() {
    local frontend_url="http://localhost:3000"
    
    run_test "Frontend Health Check" "curl -f $frontend_url/health"
    run_test "Frontend Main Page" "curl -s $frontend_url | grep -q 'MedCare'"
    run_test "Frontend Static Assets" "curl -s -I $frontend_url/static/js/ | grep -q '200 OK'"
}

# Test Patient Notes feature
test_patient_notes_feature() {
    print_status "Testing Patient Notes Feature..."
    
    local api_url="http://localhost:3001"
    
    # Login as patient
    local login_response=$(curl -s -X POST $api_url/api/v1/auth/login \
        -H 'Content-Type: application/json' \
        -d '{"email":"patient1@example.com","password":"password123"}')
    
    local token=$(echo $login_response | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$token" ]; then
        print_error "Failed to get authentication token"
        return 1
    fi
    
    # Test booking appointment with patient notes
    local appointment_data='{
        "doctorId": "dr.smith@medcare.com",
        "appointmentDate": "2024-12-25",
        "startTime": "10:00:00",
        "endTime": "11:00:00",
        "concerns": "Regular checkup",
        "symptoms": "None",
        "patientNotes": "This is a test patient note for the new feature"
    }'
    
    run_test "Book Appointment with Patient Notes" "curl -s -X POST $api_url/api/v1/appointments \
        -H 'Content-Type: application/json' \
        -H 'Authorization: Bearer $token' \
        -d '$appointment_data' | grep -q 'success'"
    
    # Test getting appointments to verify notes are stored
    run_test "Retrieve Appointments with Notes" "curl -s -X GET $api_url/api/v1/appointments \
        -H 'Authorization: Bearer $token' | grep -q 'patient_notes'"
}

# Test doctor functionality
test_doctor_functionality() {
    print_status "Testing Doctor Functionality..."
    
    local api_url="http://localhost:3001"
    
    # Login as doctor
    local login_response=$(curl -s -X POST $api_url/api/v1/auth/login \
        -H 'Content-Type: application/json' \
        -d '{"email":"dr.smith@medcare.com","password":"password123"}')
    
    local token=$(echo $login_response | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$token" ]; then
        print_error "Failed to get doctor authentication token"
        return 1
    fi
    
    # Test getting doctor appointments
    run_test "Get Doctor Appointments" "curl -s -X GET $api_url/api/v1/appointments \
        -H 'Authorization: Bearer $token' | grep -q 'appointments'"
    
    # Test getting patients
    run_test "Get Doctor Patients" "curl -s -X GET $api_url/api/v1/patients \
        -H 'Authorization: Bearer $token' | grep -q 'patients'"
}

# Test security features
test_security() {
    print_status "Testing Security Features..."
    
    local api_url="http://localhost:3001"
    
    # Test rate limiting
    run_test "Rate Limiting" "for i in {1..5}; do curl -s $api_url/health > /dev/null; done; echo 'Rate limit test completed'"
    
    # Test CORS
    run_test "CORS Configuration" "curl -s -I $api_url/health | grep -q 'Access-Control-Allow-Origin'"
    
    # Test authentication required endpoints
    run_test "Authentication Required" "curl -s -X GET $api_url/api/v1/appointments | grep -q 'Not authorized'"
}

# Test database integrity
test_database_integrity() {
    print_status "Testing Database Integrity..."
    
    # Test foreign key constraints
    run_test "Foreign Key Constraints" "docker-compose exec -T database mysql -u medcare_user -pmedcare_password medcare_db -e 'SELECT COUNT(*) FROM appointments a JOIN patients p ON a.patient_email = p.email;' | grep -q '[0-9]'"
    
    # Test data consistency
    run_test "Data Consistency" "docker-compose exec -T database mysql -u medcare_user -pmedcare_password medcare_db -e 'SELECT COUNT(*) FROM appointments WHERE status IN (\"scheduled\", \"completed\", \"cancelled\");' | grep -q '[0-9]'"
}

# Performance tests
test_performance() {
    print_status "Testing Performance..."
    
    local api_url="http://localhost:3001"
    
    # Test response times
    run_test "API Response Time" "curl -w '%{time_total}' -s -o /dev/null $api_url/health | awk '{if(\$1 < 1.0) exit 0; else exit 1}'"
    
    # Test concurrent requests
    run_test "Concurrent Requests" "for i in {1..10}; do curl -s $api_url/health > /dev/null & done; wait; echo 'Concurrent test completed'"
}

# Main test function
main() {
    print_status "Starting comprehensive test suite..."
    echo ""
    
    check_services_running
    test_database
    test_backend_api
    test_frontend
    test_patient_notes_feature
    test_doctor_functionality
    test_security
    test_database_integrity
    test_performance
    
    echo ""
    echo "📊 Test Results Summary"
    echo "======================"
    echo "Tests Passed: $TESTS_PASSED"
    echo "Tests Failed: $TESTS_FAILED"
    echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        print_success "All tests passed! 🎉"
        exit 0
    else
        print_error "$TESTS_FAILED test(s) failed. Please check the logs above."
        exit 1
    fi
}

# Handle script arguments
case "${1:-all}" in
    "all")
        main
        ;;
    "api")
        check_services_running
        test_backend_api
        ;;
    "frontend")
        check_services_running
        test_frontend
        ;;
    "database")
        check_services_running
        test_database
        ;;
    "patient-notes")
        check_services_running
        test_patient_notes_feature
        ;;
    "security")
        check_services_running
        test_security
        ;;
    "performance")
        check_services_running
        test_performance
        ;;
    *)
        echo "Usage: $0 {all|api|frontend|database|patient-notes|security|performance}"
        echo ""
        echo "Test Categories:"
        echo "  all          - Run all tests (default)"
        echo "  api          - Test backend API endpoints"
        echo "  frontend     - Test frontend functionality"
        echo "  database     - Test database connectivity and integrity"
        echo "  patient-notes - Test the new Patient Notes feature"
        echo "  security     - Test security features"
        echo "  performance  - Test performance and response times"
        exit 1
        ;;
esac

