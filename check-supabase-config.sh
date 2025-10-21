#!/bin/bash
# Check Supabase redirect configuration

SUPABASE_URL="https://bsldtgivgtyzacwyvcfh.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzbGR0Z2l2Z3R5emFjd3l2Y2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MzQ1NzMsImV4cCI6MjA3NTUxMDU3M30.vjHPo6WEASxYBOAGYmZ93o5n9RhZvANSlLhaT-wagTs"

echo "Checking Supabase auth configuration..."
echo ""

curl -s "${SUPABASE_URL}/auth/v1/settings" \
  -H "apikey: ${ANON_KEY}" \
  | python3 -m json.tool 2>/dev/null | grep -A 20 "redirect"

echo ""
echo "If you see 'external_provider_redirect_url' or 'redirect_urls', those are the allowed redirects."
