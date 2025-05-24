# 🔧 Environment Setup Guide

You're absolutely right! The app needs proper API keys to work. Here's exactly how to set up all the required environment variables.

## 📝 Step 1: Create Your Environment File

Create a file named `.env.local` in the root directory with these variables:

```bash
# Copy and paste this into your .env.local file

# =============================================================================
# SHOPIFY CONFIGURATION (REQUIRED)
# =============================================================================
SHOPIFY_API_KEY=your_actual_api_key_here
SHOPIFY_API_SECRET=your_actual_api_secret_here
SHOPIFY_ACCESS_TOKEN=your_actual_access_token_here
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_APP_URL=http://localhost:3000
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret_here
SCOPES=write_orders,read_orders,write_products,read_products,write_draft_orders,read_draft_orders

# =============================================================================
# PRINT-ON-DEMAND API (REQUIRED)
# =============================================================================
POD_API_URL=https://savitarna.amspauda.lt/api
POD_API_KEY=your_actual_am_spauda_api_key_here

# =============================================================================
# DATABASE
# =============================================================================
DATABASE_URL="file:./dev.db"
```

## 🛍️ Step 2: Get Shopify API Credentials

### Create a Private App in Shopify:

1. **Go to Shopify Admin** → Settings → Apps and sales channels
2. **Click "Develop apps"** → "Create an app"
3. **Name your app**: "Print on Demand Integration"
4. **Configure API scopes** (Admin API access):
   - ✅ `read_orders`
   - ✅ `write_orders`
   - ✅ `read_products`
   - ✅ `write_products`
   - ✅ `read_draft_orders`
   - ✅ `write_draft_orders`

5. **Install the app** and copy these values:
   - `SHOPIFY_API_KEY` = API key from the app
   - `SHOPIFY_API_SECRET` = API secret key from the app
   - `SHOPIFY_ACCESS_TOKEN` = Admin API access token from the app

6. **Set your store domain**:
   - `SHOPIFY_STORE_DOMAIN` = your-store.myshopify.com (without https://)

## 🖨️ Step 3: Get AM Spauda API Key

Contact AM Spauda support to get your API key:
- `POD_API_KEY` = Your AM Spauda API key

## 🔐 Step 4: Generate Security Secret

Generate one random secret for webhook security:

```bash
# Generate webhook secret
openssl rand -base64 32
```

Use this for:
- `SHOPIFY_WEBHOOK_SECRET` = Generated secret

## 🌐 Step 5: For Production (Vercel)

When deploying to Vercel:

1. **Update app URL**:
   ```
   SHOPIFY_APP_URL=https://your-app.vercel.app
   ```

2. **Add all environment variables** in Vercel dashboard:
   - Go to your Vercel project → Settings → Environment Variables
   - Add each variable from your `.env.local`

3. **Update webhook URL** in Shopify:
   - Go to Shopify Admin → Settings → Notifications → Webhooks
   - Update webhook URL to: `https://your-app.vercel.app/api/webhooks/orders/paid`

## ✅ Step 6: Test Configuration

Create your `.env.local` file with all the values above, then run:

```bash
# Test the setup
npm run dev

# Test API endpoints
curl http://localhost:3000/api/setup
```

## 🔍 Example .env.local File

Here's what your actual `.env.local` should look like (with real values):

```bash
# REAL SHOPIFY VALUES
SHOPIFY_API_KEY=abc123def456ghi789
SHOPIFY_API_SECRET=xyz789uvw456rst123
SHOPIFY_ACCESS_TOKEN=shpat_abcdef123456789
SHOPIFY_STORE_DOMAIN=myawesomestore.myshopify.com
SHOPIFY_APP_URL=http://localhost:3000
SHOPIFY_WEBHOOK_SECRET=x8kJ2mN9qR7sT4vB8cX6dF3gH1kL5nP9
SCOPES=write_orders,read_orders,write_products,read_products,write_draft_orders,read_draft_orders

# REAL POD API VALUES  
POD_API_URL=https://savitarna.amspauda.lt/api
POD_API_KEY=your_real_am_spauda_api_key_here

# DATABASE
DATABASE_URL="file:./dev.db"
```

## 🚨 Common Issues

**App doesn't send to POD provider?**
- ✅ Check `POD_API_KEY` is set correctly
- ✅ Verify API key works by testing AM Spauda API directly
- ✅ Check product SKUs match AM Spauda product IDs

**Webhook not receiving orders?**
- ✅ Check `SHOPIFY_WEBHOOK_SECRET` is set
- ✅ Verify webhook URL in Shopify Admin
- ✅ Check `SHOPIFY_ACCESS_TOKEN` has correct permissions

**Database errors?**
- ✅ Run `npx prisma db push` after setting `DATABASE_URL`

---

**Without these environment variables properly set, the app won't work!** Make sure to replace ALL the placeholder values with your actual credentials. 