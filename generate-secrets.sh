#!/bin/bash

echo "🔐 Generating webhook secret for your Shopify app..."
echo ""
echo "SHOPIFY_WEBHOOK_SECRET=$(openssl rand -base64 32)"
echo ""
echo "✅ Copy this secret to your .env.local file!"
echo ""
echo "💡 Need help? Check ENVIRONMENT_SETUP.md for complete setup instructions." 