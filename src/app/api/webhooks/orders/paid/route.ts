import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PrintOnDemandService } from '@/lib/print-on-demand'
import { ShopifyOrderData } from '@/lib/shopify'
import crypto from 'crypto'

// Verify webhook authenticity
function verifyWebhook(rawBody: string, signature: string): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET
  if (!secret) return false

  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(rawBody, 'utf8')
  const computedSignature = hmac.digest('base64')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'base64'),
    Buffer.from(computedSignature, 'base64')
  )
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-shopify-hmac-sha256')
    const rawBody = await request.text()
    
    // Verify webhook signature
    if (!signature || !verifyWebhook(rawBody, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderData: ShopifyOrderData = JSON.parse(rawBody)
    console.log(`Processing paid order: ${orderData.name} (ID: ${orderData.id})`)

    // Save order to database
    await prisma.shopifyOrder.upsert({
      where: { id: orderData.id.toString() },
      update: {
        name: orderData.name,
        email: orderData.email || null,
        financialStatus: orderData.financial_status || null,
        fulfillmentStatus: orderData.fulfillment_status || null,
        totalPrice: orderData.total_price,
        currency: orderData.currency,
        createdAt: new Date(orderData.created_at),
        updatedAt: new Date(orderData.updated_at),
        orderData: JSON.stringify(orderData),
      },
      create: {
        id: orderData.id.toString(),
        name: orderData.name,
        email: orderData.email || null,
        financialStatus: orderData.financial_status || null,
        fulfillmentStatus: orderData.fulfillment_status || null,
        totalPrice: orderData.total_price,
        currency: orderData.currency,
        createdAt: new Date(orderData.created_at),
        updatedAt: new Date(orderData.updated_at),
        orderData: JSON.stringify(orderData),
      },
    })

    // Check if order contains print-on-demand products
    const podService = new PrintOnDemandService()
    const hasPODProducts = await podService.hasPODProducts(orderData.line_items)

    if (hasPODProducts) {
      console.log(`Order ${orderData.name} contains POD products, sending to print service`)
      
      // Transform Shopify line items to POD format
      const podProducts = podService.transformShopifyOrder(orderData.line_items)
      
      if (podProducts.length > 0) {
        try {
          // Send order to print-on-demand service
          const podOrder = await podService.createOrder({ products: podProducts })
          
          // Create POD order record
          await prisma.printOnDemandOrder.create({
            data: {
              shopifyOrderId: orderData.id.toString(),
              podApiOrderId: podOrder.id || null,
              status: 'sent',
              products: JSON.stringify(podProducts),
            },
          })

          // Update Shopify order with POD details
          await prisma.shopifyOrder.update({
            where: { id: orderData.id.toString() },
            data: {
              podOrderId: podOrder.id || null,
              podStatus: podOrder.status || 'sent',
              podSentAt: new Date(),
            },
          })

          console.log(`Successfully sent order ${orderData.name} to POD service`)
        } catch (error) {
          console.error(`Failed to send order ${orderData.name} to POD service:`, error)
          
          // Create failed POD order record
          await prisma.printOnDemandOrder.create({
            data: {
              shopifyOrderId: orderData.id.toString(),
              status: 'failed',
              products: JSON.stringify(podProducts),
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
            },
          })
        }
      }
    } else {
      console.log(`Order ${orderData.name} does not contain POD products, skipping`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 