#!/bin/bash

# Backend-Frontend Connection Test Script for Country Explorer
# Usage: ./test-connection.sh

echo "🧪 Country Explorer Backend-Frontend Connection Tests"
echo "===================================================="

# Configuration
BACKEND_URL="http://localhost:5001"
API_BASE="$BACKEND_URL/api/v1"
FRONTEND_URL="http://localhost:5173"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    
    echo -e "\n${BLUE}Testing: $name${NC}"
    echo -e "${YELLOW}URL: $url${NC}"
    
    # Make the request and capture response details
    response=$(curl -s -w "HTTPSTATUS:%{http_code};TIME:%{time_total}" "$url")
    http_status=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    time_total=$(echo "$response" | grep -o "TIME:[0-9.]*" | cut -d: -f2)
    body=$(echo "$response" | sed -E 's/HTTPSTATUS:[0-9]*;TIME:[0-9.]*$//')
    
    # Check if request was successful
    if [ "$http_status" = "$expected_status" ]; then
        echo -e "${GREEN}✅ SUCCESS${NC} - Status: $http_status, Time: ${time_total}s"
        
        # Try to pretty print JSON if it's valid
        if echo "$body" | jq . > /dev/null 2>&1; then
            echo -e "${GREEN}Response (first 200 chars):${NC}"
            echo "$body" | jq -C . | head -c 200
            echo -e "\n..."
        else
            echo -e "${GREEN}Response:${NC} $body"
        fi
    else
        echo -e "${RED}❌ FAILED${NC} - Expected: $expected_status, Got: $http_status"
        echo -e "${RED}Error:${NC} $body"
    fi
}

# Check if services are running
echo -e "\n${BLUE}1. Service Status Check${NC}"
echo "========================"

# Check MongoDB
if lsof -i :27017 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MongoDB is running on port 27017${NC}"
else
    echo -e "${RED}❌ MongoDB is NOT running on port 27017${NC}"
    echo -e "${YELLOW}💡 Start with: mongod --dbpath /tmp/mongodb-data${NC}"
fi

# Check Backend
if lsof -i :5001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running on port 5001${NC}"
else
    echo -e "${RED}❌ Backend is NOT running on port 5001${NC}"
    echo -e "${YELLOW}💡 Start with: cd backend && npm run dev${NC}"
fi

# Check Frontend
if lsof -i :5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running on port 5173${NC}"
else
    echo -e "${RED}❌ Frontend is NOT running on port 5173${NC}"
    echo -e "${YELLOW}💡 Start with: npm run dev${NC}"
fi

# API Endpoint Tests
echo -e "\n${BLUE}2. API Endpoint Tests${NC}"
echo "====================="

# Test 1: Health Check
test_endpoint "Health Check" "$BACKEND_URL/health" "200"

# Test 2: Countries List (Basic)
test_endpoint "Countries List (Basic)" "$API_BASE/countries" "200"

# Test 3: Countries with Pagination
test_endpoint "Countries with Pagination" "$API_BASE/countries?page=1&limit=5" "200"

# Test 4: Countries Search
test_endpoint "Countries Search" "$API_BASE/countries/search?q=united" "200"

# Test 5: Specific Country
test_endpoint "Specific Country" "$API_BASE/countries/1" "200"

# Test 6: Invalid Endpoint (should return 404)
test_endpoint "Invalid Endpoint (404 test)" "$API_BASE/invalid-endpoint" "404"

# CORS Test
echo -e "\n${BLUE}3. CORS Configuration Test${NC}"
echo "==========================="

cors_response=$(curl -s -H "Origin: $FRONTEND_URL" \
                     -H "Access-Control-Request-Method: GET" \
                     -H "Access-Control-Request-Headers: Content-Type" \
                     -X OPTIONS \
                     "$API_BASE/countries")

if echo "$cors_response" | grep -i "access-control-allow-origin" > /dev/null; then
    echo -e "${GREEN}✅ CORS is properly configured${NC}"
else
    echo -e "${RED}❌ CORS might not be properly configured${NC}"
    echo -e "${YELLOW}💡 Check CORS middleware in backend server${NC}"
fi

# Performance Test
echo -e "\n${BLUE}4. Performance Test${NC}"
echo "==================="

echo "Testing response times for countries endpoint..."
total_time=0
successful_requests=0

for i in {1..5}; do
    response_time=$(curl -s -w "%{time_total}" -o /dev/null "$API_BASE/countries?page=1&limit=10")
    if [ $? -eq 0 ]; then
        echo "Request $i: ${response_time}s"
        total_time=$(echo "$total_time + $response_time" | bc -l)
        successful_requests=$((successful_requests + 1))
    else
        echo -e "${RED}Request $i: FAILED${NC}"
    fi
done

if [ $successful_requests -gt 0 ]; then
    average_time=$(echo "scale=3; $total_time / $successful_requests" | bc -l)
    echo -e "${GREEN}Average response time: ${average_time}s${NC}"
    
    if (( $(echo "$average_time < 1.0" | bc -l) )); then
        echo -e "${GREEN}✅ Performance: GOOD${NC}"
    elif (( $(echo "$average_time < 3.0" | bc -l) )); then
        echo -e "${YELLOW}⚠️  Performance: ACCEPTABLE${NC}"
    else
        echo -e "${RED}❌ Performance: POOR${NC}"
    fi
fi

# Environment Check
echo -e "\n${BLUE}5. Environment Configuration${NC}"
echo "============================="

if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file found${NC}"
    echo "Key environment variables:"
    grep -E "VITE_API_URL|NODE_ENV|PORT" .env | while read line; do
        echo "  $line"
    done
else
    echo -e "${RED}❌ .env file not found${NC}"
fi

# Summary
echo -e "\n${BLUE}6. Test Summary${NC}"
echo "==============="

# Check if backend is responding
if curl -s "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is responsive and healthy${NC}"
    
    # Check if countries endpoint works
    if curl -s "$API_BASE/countries?page=1&limit=1" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Countries API is working${NC}"
        echo -e "${GREEN}🎉 Backend-Frontend connection should be working!${NC}"
        echo -e "\n${YELLOW}Next steps:${NC}"
        echo "1. Open $FRONTEND_URL in your browser"
        echo "2. Check browser console for any errors"
        echo "3. Verify data is loading in the UI"
    else
        echo -e "${RED}❌ Countries API is not responding${NC}"
    fi
else
    echo -e "${RED}❌ Backend is not responding${NC}"
    echo -e "\n${YELLOW}Troubleshooting steps:${NC}"
    echo "1. Start MongoDB: mongod --dbpath /tmp/mongodb-data"
    echo "2. Start Backend: cd backend && npm run dev"
    echo "3. Check for error messages in terminal"
fi

echo -e "\n${BLUE}📝 Additional Testing Tools:${NC}"
echo "• Browser DevTools Network tab: Check API requests"
echo "• Browser Console: Look for JavaScript errors"
echo "• Postman: Import API collection for detailed testing"
echo "• VS Code REST Client: Test endpoints directly in editor"