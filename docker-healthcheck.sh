#!/bin/bash
# Docker Health Check Utility
# Run this after deploying to verify everything is working

echo "=========================================="
echo "Network Helper - Docker Health Check"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
PASSED=0
FAILED=0

check_command() {
    local name=$1
    local command=$2
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $name"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $name"
        ((FAILED++))
    fi
}

check_output() {
    local name=$1
    local command=$2
    
    echo ""
    echo "📋 $name:"
    eval "$command" 2>/dev/null || echo "  (No output or error)"
}

# ====== CHECKS ======

echo "🔍 Checking Docker..."
check_command "Docker installed" "which docker"
check_command "Docker running" "docker info"

echo ""
echo "🔍 Checking Containers..."
check_command "Backend container running" "docker ps | grep netlink_backend"
check_command "Frontend container running" "docker ps | grep netlink_frontend"

echo ""
echo "🔍 Checking Network Connectivity..."
check_command "Frontend can reach backend" "docker exec netlink_frontend ping -c 1 backend"
check_command "Backend can serve requests" "curl -s http://localhost:3000/api/reports/count"

echo ""
echo "🔍 Checking API Endpoints..."
check_command "Backend health check" "curl -s http://localhost:3000/api/reports/count | grep -q total"
check_command "Frontend home page" "curl -s http://localhost/ | grep -q html"

echo ""
echo "🔍 Checking Nginx Proxy..."
check_command "Nginx proxy to backend" "curl -s http://localhost/api/reports/count | grep -q total"

echo ""
echo "=========================================="
echo "📊 Summary"
echo "=========================================="
echo -e "Passed: ${GREEN}$PASSED${NC} | Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! System is healthy.${NC}"
    echo ""
    echo "✅ You can access:"
    echo "   Frontend:  http://localhost"
    echo "   Backend:   http://localhost:3000"
    echo "   API Test:  http://localhost:3000/api/reports/count"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. See details above.${NC}"
    echo ""
    echo "💡 Troubleshooting tips:"
    echo "   1. Check if containers are running: docker-compose ps"
    echo "   2. View logs: docker-compose logs -f"
    echo "   3. Verify network: docker network inspect netlink_netlink_network"
    exit 1
fi
