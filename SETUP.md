# Quick Setup Guide

## 🚀 Your Shopify Print-on-Demand App is Ready!

This modern Shopify app automatically processes orders and sends print-on-demand requests to AM Spauda API.

## ✅ What's Included

- **Modern Dashboard**: Beautiful order management interface
- **Automatic Processing**: Webhook-driven order processing
- **POD Integration**: Direct integration with AM Spauda API
- **Real-time Status**: Track order and printing status
- **Responsive Design**: Works on all devices
- **TypeScript**: Full type safety
- **Prisma ORM**: Modern database management

## 🛠️ Next Steps

### 1. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `SHOPIFY_API_KEY` - From your Shopify private app
- `SHOPIFY_API_SECRET` - From your Shopify private app  
- `SHOPIFY_ACCESS_TOKEN` - From your Shopify private app
- `SHOPIFY_STORE_DOMAIN` - Your store domain (e.g., mystore.myshopify.com)
- `POD_API_KEY` - Your AM Spauda API key
- `SHOPIFY_WEBHOOK_SECRET` - Generate a random secret for webhook security

### 2. Create Shopify Private App

1. Go to Shopify Admin → Settings → Apps and sales channels
2. Click "Develop apps" → "Create an app"
3. Configure permissions:
   - Orders: Read and write
   - Products: Read and write
   - Draft orders: Read and write
4. Install and copy the access token

### 3. Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel
```

Add all environment variables in Vercel dashboard.

### 4. Configure Webhook

In Shopify Admin → Settings → Notifications → Webhooks:
- Event: Order payment
- Format: JSON
- URL: `https://your-app.vercel.app/api/webhooks/orders/paid`

### 5. Test the Integration

1. Place a test order with POD products (products with SKUs matching AM Spauda product IDs)
2. Check the dashboard at your app URL
3. Verify the order appears and POD status is updated

## 📊 Dashboard Features

- **Order List**: View all orders with status indicators
- **Filtering**: Filter by POD orders, regular orders, or all
- **Pagination**: Navigate through large order lists
- **Status Tracking**: Visual indicators for order and POD status
- **Error Handling**: Display error messages for failed POD orders

## 🔧 API Endpoints

- `GET /` - Dashboard
- `GET /api/orders` - Fetch orders with pagination
- `POST /api/webhooks/orders/paid` - Shopify webhook handler
- `GET /api/setup` - Setup information
- `POST /api/setup` - Initialize database

## 🐛 Troubleshooting

### Webhook Issues
- Verify webhook URL is correct
- Check webhook secret matches environment variable
- Review Vercel function logs

### POD Orders Not Sending
- Verify POD_API_KEY is correct
- Check product SKUs match POD product IDs
- Review API logs for errors

### Database Issues
- Run `npx prisma db push` to sync schema
- Check DATABASE_URL is correct

## 📝 Development

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

## 🎯 How It Works

1. Customer places order in Shopify
2. Shopify sends webhook when payment confirmed
3. App checks if order contains POD products (by SKU)
4. If POD products found, sends order to AM Spauda API
5. Dashboard displays order status and POD processing status

## 📞 Support

- For AM Spauda API issues: Contact AM Spauda support
- For app issues: Check the logs and documentation

---

**Built with ❤️ using Next.js 15, TypeScript, Tailwind CSS, and Prisma** 