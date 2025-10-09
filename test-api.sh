#!/bin/bash

TENANT_ID="11111111-1111-1111-1111-111111111111"
BASE_URL="http://localhost:3000"

echo "=== Testing PLM API ==="
echo ""

echo "1. Health Check:"
curl -s "$BASE_URL/health" | jq .
echo ""

echo "2. Create Style:"
STYLE_ID=$(curl -s -X POST "$BASE_URL/styles" \
  -H 'Content-Type: application/json' \
  -H "X-Tenant-Id: $TENANT_ID" \
  -d '{
    "code": "STY-1001",
    "name": "Classic Tee",
    "status": "draft",
    "custom": {
      "season": "SS25",
      "brand": "Fynd",
      "targetGender": "unisex",
      "launchDate": "2025-10-01",
      "mrp": 999
    }
  }' | tee /dev/tty | jq -r '.id')
echo ""

echo "3. List All Styles:"
curl -s "$BASE_URL/styles" -H "X-Tenant-Id: $TENANT_ID" | jq .
echo ""

if [ -n "$STYLE_ID" ] && [ "$STYLE_ID" != "null" ]; then
  echo "4. Get Style by ID ($STYLE_ID):"
  curl -s "$BASE_URL/styles/$STYLE_ID" -H "X-Tenant-Id: $TENANT_ID" | jq .
  echo ""

  echo "5. Update Style:"
  curl -s -X PUT "$BASE_URL/styles/$STYLE_ID" \
    -H 'Content-Type: application/json' \
    -H "X-Tenant-Id: $TENANT_ID" \
    -d '{
      "code": "STY-1001",
      "name": "Classic Tee Updated",
      "status": "active",
      "custom": {
        "season": "FW25",
        "brand": "Fynd",
        "targetGender": "men",
        "launchDate": "2025-12-01",
        "mrp": 1099
      }
    }' | jq .
  echo ""
fi

echo "6. Test Validation Error (missing required field):"
curl -s -X POST "$BASE_URL/styles" \
  -H 'Content-Type: application/json' \
  -H "X-Tenant-Id: $TENANT_ID" \
  -d '{
    "code": "STY-1002",
    "name": "Invalid Style",
    "custom": {
      "season": "SS25"
    }
  }' | jq .
echo ""

echo "=== Tests Complete ==="
