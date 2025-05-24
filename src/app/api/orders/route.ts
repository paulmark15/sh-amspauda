import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ShopifyOrder, PrintOnDemandOrder } from '@/generated/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status) {
      if (status === 'pod') {
        where.podOrderId = { not: null }
      } else if (status === 'no-pod') {
        where.podOrderId = null
      }
    }

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      prisma.shopifyOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.shopifyOrder.count({ where })
    ])

    // Get related POD orders
    const shopifyOrderIds = orders.map((order: ShopifyOrder) => order.id)
    const podOrders = await prisma.printOnDemandOrder.findMany({
      where: {
        shopifyOrderId: { in: shopifyOrderIds }
      }
    })

    // Create a map for quick lookup
    const podOrderMap = new Map<string, PrintOnDemandOrder[]>()
    podOrders.forEach((podOrder: PrintOnDemandOrder) => {
      if (!podOrderMap.has(podOrder.shopifyOrderId)) {
        podOrderMap.set(podOrder.shopifyOrderId, [])
      }
      podOrderMap.get(podOrder.shopifyOrderId)?.push(podOrder)
    })

    // Combine data
    const ordersWithPOD = orders.map((order: ShopifyOrder) => ({
      ...order,
      orderData: JSON.parse(order.orderData),
      podOrders: podOrderMap.get(order.id) || []
    }))

    return NextResponse.json({
      orders: ordersWithPOD,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 