#!/bin/bash

# Backend API Testing Script
# Tests all major endpoints and functionality

API_BASE="http://localhost:5001"
PASS_COUNT=0
FAIL_COUNT=0
TOTAL_COUNT=0

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local test_name="$1"
    local url="$2"
    local expected_status="$3"
    local additional_check="$4"
    
    echo -n "Testing $test_name... "
    
    # Make request and capture response
    response=$(curl -s -w "\n%{http_code}" "$url")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    ((TOTAL_COUNT++))
    
    if [ "$http_code" = "$expected_status" ]; then
        if [ -n "$additional_check" ]; then
            if echo "$body" | jq -e "$additional_check" > /dev/null 2>&1; then
                echo -e "${GREEN}PASS${NC}"
                ((PASS_COUNT++))
            else
                echo -e "${RED}FAIL${NC} (Check failed: $additional_check)"
                ((FAIL_COUNT++))
            fi
        else
            echo -e "${GREEN}PASS${NC}"
            ((PASS_COUNT++))
        fi
    else
        echo -e "${RED}FAIL${NC} (Expected $expected_status, got $http_code)"
        echo "Response: $body"
        ((FAIL_COUNT++))
    fi
}

echo "🚀 Starting Backend API Tests..."
echo "API Base URL: $API_BASE"
echo

# Test 1: Health Check
test_endpoint "Health Check" "$API_BASE/health" "200" '.success == true'

# Test 2: Basic Countries Endpoint
test_endpoint "Countries List" "$API_BASE/api/v1/countries" "200" '.success == true and (.data | type) == "array"'

# Test 3: Pagination
test_endpoint "Pagination (page=1, limit=5)" "$API_BASE/api/v1/countries?page=1&limit=5" "200" '.pagination.page == 1 and .pagination.limit == 5'

# Test 4: Search
test_endpoint "Search Functionality" "$API_BASE/api/v1/countries?search=united" "200" '.success == true'

# Test 5: Region Filter
test_endpoint "Region Filter" "$API_BASE/api/v1/countries?region=Europe" "200" '.success == true'

# Test 6: Invalid endpoint (404)
test_endpoint "404 Error Handling" "$API_BASE/api/v1/nonexistent" "404" '.success == false'

# Test 7: CORS preflight
echo -n "Testing CORS Headers... "
cors_response=$(curl -s -H "Origin: http://localhost:5174" -H "Access-Control-Request-Method: GET" -X OPTIONS "$API_BASE/api/v1/countries" -w "%{http_code}")
cors_code=$(echo "$cors_response" | tail -c 4)

((TOTAL_COUNT++))

if [ "$cors_code" = "200" ] || [ "$cors_code" = "204" ]; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS_COUNT++))
else
    echo -e "${RED}FAIL${NC} (CORS preflight failed with code $cors_code)"
    ((FAIL_COUNT++))
fi

echo
echo "📊 Test Results Summary:"
echo -e "✅ Passed: ${GREEN}$PASS_COUNT${NC}/$TOTAL_COUNT"
echo -e "❌ Failed: ${RED}$FAIL_COUNT${NC}/$TOTAL_COUNT"

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}All tests passed! Backend is working perfectly.${NC}"
    exit 0
else
    echo -e "\n⚠️ ${YELLOW}Some tests failed. Check the backend configuration.${NC}"
    exit 1
fi