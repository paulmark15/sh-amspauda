import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Initialize database tables if they don't exist
    // This is a simple way to ensure tables are created
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "shopify_orders" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT,
      "financialStatus" TEXT,
      "fulfillmentStatus" TEXT,
      "totalPrice" TEXT NOT NULL,
      "currency" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL,
      "updatedAt" DATETIME NOT NULL,
      "podOrderId" TEXT,
      "podStatus" TEXT,
      "podSentAt" DATETIME,
      "orderData" TEXT NOT NULL
    )`

    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "pod_orders" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "shopifyOrderId" TEXT NOT NULL,
      "podApiOrderId" TEXT,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "products" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      "errorMessage" TEXT
    )`

    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "app_settings" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "key" TEXT NOT NULL UNIQUE,
      "value" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )`

    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Session" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "shop" TEXT NOT NULL,
      "state" TEXT NOT NULL,
      "isOnline" BOOLEAN NOT NULL DEFAULT false,
      "scope" TEXT,
      "expires" DATETIME,
      "accessToken" TEXT NOT NULL,
      "userId" TEXT,
      "firstName" TEXT,
      "lastName" TEXT,
      "email" TEXT,
      "accountOwner" BOOLEAN NOT NULL DEFAULT false,
      "locale" TEXT,
      "collaborator" BOOLEAN DEFAULT false,
      "emailVerified" BOOLEAN DEFAULT false
    )`

    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully' 
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Shopify Print-on-Demand App Setup',
    endpoints: {
      webhook: '/api/webhooks/orders/paid',
      orders: '/api/orders',
      setup: '/api/setup'
    },
    instructions: [
      '1. Copy .env.example to .env.local and fill in your values',
      '2. Run POST /api/setup to initialize the database',
      '3. Create a webhook in Shopify Admin pointing to your webhook endpoint',
      '4. Test the integration by placing an order in your store'
    ],
    requiredEnvVars: [
      'SHOPIFY_API_KEY',
      'SHOPIFY_API_SECRET',
      'SHOPIFY_STORE_DOMAIN',
      'SHOPIFY_ACCESS_TOKEN',
      'POD_API_KEY',
      'SHOPIFY_WEBHOOK_SECRET'
    ]
  })
} 