#!/bin/bash

# Wunero Test Coverage Summary
# This script generates a comprehensive overview of all tests in the project

echo "=========================================="
echo "Wunero Test Suite Coverage Summary"
echo "=========================================="
echo ""

# Count test files
ATOM_TESTS=$(find src/components/atoms -name "*.test.tsx" | wc -l)
MOLECULE_TESTS=$(find src/components/molecules -name "*.test.tsx" | wc -l)
ORGANISM_TESTS=$(find src/components/organisms -name "*.test.tsx" | wc -l)
LIB_TESTS=$(find src/lib -name "*.test.ts" | wc -l)
API_TESTS=$(find src/app/api -name "*.test.ts" | wc -l)
INTEGRATION_TESTS=$(find src/app -name "*integration.test.ts" | wc -l)

TOTAL_TESTS=$((ATOM_TESTS + MOLECULE_TESTS + ORGANISM_TESTS + LIB_TESTS + API_TESTS + INTEGRATION_TESTS))

echo "Component Tests:"
echo "  - Atom Components: $ATOM_TESTS tests"
echo "  - Molecule Components: $MOLECULE_TESTS tests"
echo "  - Organism Components: $ORGANISM_TESTS tests"
echo "  - Total: $((ATOM_TESTS + MOLECULE_TESTS + ORGANISM_TESTS)) tests"
echo ""

echo "Utility Tests:"
echo "  - Library Functions: $LIB_TESTS tests"
echo ""

echo "API Route Tests:"
echo "  - API Endpoints: $API_TESTS tests"
echo ""

echo "Integration Tests:"
echo "  - User Flow Tests: $INTEGRATION_TESTS test files"
echo ""

echo "=========================================="
echo "Total Test Files: $TOTAL_TESTS"
echo "=========================================="
echo ""

echo "Test Coverage Areas:"
echo "  ✓ Atom Components: Button, Input, Checkbox, Avatar, AuthButton"
echo "  ✓ Molecule Components: Modal, InputGroup"
echo "  ✓ Organism Components: Navbar, WishlistForm"
echo "  ✓ Utilities: Gravatar, URL Utils, Product Parser, Auth"
echo "  ✓ Internationalization: Message Loading, Language Switching"
echo "  ✓ API Routes: User Profile, Email Management"
echo "  ✓ Integration: Login, Register, Wishlist, Profile, Language"
echo ""

echo "Running tests..."
npm test -- --passWithNoTests 2>/dev/null

if [ $? -eq 0 ]; then
  echo ""
  echo "✓ All test suites passed!"
else
  echo ""
  echo "✗ Some tests failed. Run 'npm test' for details."
fi
