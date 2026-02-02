#!/bin/bash
# Wunero Test Suite - File Verification Script

echo "=================================="
echo "Wunero Test Suite - File Check"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check file
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1 (MISSING)"
        return 1
    fi
}

# Function to check directory
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        return 0
    else
        echo -e "${RED}✗${NC} $1/ (MISSING)"
        return 1
    fi
}

echo "Configuration Files:"
check_file "jest.config.ts"
check_file "jest.setup.ts"
check_file "package.json"
echo ""

echo "Atom Component Tests:"
check_file "src/components/atoms/WuButton/__tests__/WuButton.test.tsx"
check_file "src/components/atoms/WuInput/__tests__/WuInput.test.tsx"
check_file "src/components/atoms/WuCheckbox/__tests__/WuCheckbox.test.tsx"
check_file "src/components/atoms/WuAvatar/__tests__/WuAvatar.test.tsx"
check_file "src/components/atoms/WuAuthButton/__tests__/WuAuthButton.test.tsx"
check_file "src/components/atoms/WuLanguageSwitcher/__tests__/WuLanguageSwitcher.test.tsx"
echo ""

echo "Molecule Component Tests:"
check_file "src/components/molecules/WuModal/__tests__/WuModal.test.tsx"
check_file "src/components/molecules/WuInputGroup/__tests__/WuInputGroup.test.tsx"
echo ""

echo "Organism Component Tests:"
check_file "src/components/organisms/WuNavbar/__tests__/WuNavbar.test.tsx"
check_file "src/components/organisms/WuWishlistForm/__tests__/WuWishlistForm.test.tsx"
echo ""

echo "Utility Tests:"
check_file "src/lib/__tests__/gravatar.test.ts"
check_file "src/lib/__tests__/urlUtils.test.ts"
check_file "src/lib/__tests__/productParser.test.ts"
check_file "src/lib/__tests__/auth.test.ts"
check_file "src/lib/__tests__/i18n.test.ts"
check_file "src/lib/__tests__/performance.test.ts"
check_file "src/lib/__tests__/accessibility.test.ts"
echo ""

echo "API Route Tests:"
check_file "src/app/api/user/profile/__tests__/route.test.ts"
check_file "src/app/api/user/email/__tests__/route.test.ts"
echo ""

echo "Integration Tests:"
check_file "src/app/__tests__/integration.test.ts"
echo ""

echo "Documentation:"
check_file "TEST_DOCUMENTATION_INDEX.md"
check_file "QUICK_TEST_START.md"
check_file "TEST_VERIFICATION_CHECKLIST.md"
check_file "TEST_GUIDE.md"
check_file "TESTING_DOCUMENTATION.md"
check_file "TEST_IMPLEMENTATION_SUMMARY.md"
check_file "README_TESTS.md"
echo ""

echo "Other Scripts:"
check_file "test-coverage.sh"
echo ""

echo "=================================="
echo "Test File Summary"
echo "=================================="

# Count test files
COMPONENT_TESTS=$(find src/components -name "*.test.tsx" 2>/dev/null | wc -l)
UTIL_TESTS=$(find src/lib -name "*.test.ts" 2>/dev/null | wc -l)
API_TESTS=$(find src/app/api -name "*.test.ts" 2>/dev/null | wc -l)
INTEGRATION_TESTS=$(find src/app -maxdepth 2 -name "*integration.test.ts" 2>/dev/null | wc -l)

TOTAL=$((COMPONENT_TESTS + UTIL_TESTS + API_TESTS + INTEGRATION_TESTS))

echo "Component Tests: $COMPONENT_TESTS"
echo "Utility Tests: $UTIL_TESTS"
echo "API Tests: $API_TESTS"
echo "Integration Tests: $INTEGRATION_TESTS"
echo ""
echo "Total Test Files: $TOTAL"
echo ""

# Check package.json for test scripts
echo "Checking npm test scripts..."
if grep -q '"test": "jest"' package.json; then
    echo -e "${GREEN}✓${NC} npm test configured"
else
    echo -e "${RED}✗${NC} npm test not configured"
fi

if grep -q '"test:watch": "jest --watch"' package.json; then
    echo -e "${GREEN}✓${NC} npm run test:watch configured"
else
    echo -e "${RED}✗${NC} npm run test:watch not configured"
fi

if grep -q '"test:coverage": "jest --coverage"' package.json; then
    echo -e "${GREEN}✓${NC} npm run test:coverage configured"
else
    echo -e "${RED}✗${NC} npm run test:coverage not configured"
fi

echo ""
echo "=================================="
echo "Ready to run: npm test"
echo "=================================="
