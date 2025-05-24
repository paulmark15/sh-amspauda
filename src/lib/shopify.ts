import { shopifyApi, Session, ApiVersion } from '@shopify/shopify-api'
import '@shopify/shopify-api/adapters/node'

export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: process.env.SCOPES?.split(',') || [],
  hostName: process.env.SHOPIFY_APP_URL!.replace(/https?:\/\//, ''),
  apiVersion: ApiVersion.October23,
  isEmbeddedApp: true,
})

export interface ShopifyOrderData {
  id: number
  name: string
  email?: string
  financial_status?: string
  fulfillment_status?: string
  total_price: string
  currency: string
  created_at: string
  updated_at: string
  line_items: Array<{
    id: number
    product_id: number
    variant_id: number
    title: string
    quantity: number
    price: string
    sku?: string
  }>
  customer?: {
    id: number
    email?: string
    first_name?: string
    last_name?: string
  }
  shipping_address?: {
    first_name?: string
    last_name?: string
    address1?: string
    address2?: string
    city?: string
    province?: string
    country?: string
    zip?: string
    phone?: string
  }
}

export class ShopifyService {
  private session: Session

  constructor(session: Session) {
    this.session = session
  }

  async getOrder(orderId: string): Promise<ShopifyOrderData | null> {
    try {
      const client = new shopify.clients.Rest({ session: this.session })
      const response = await client.get({
        path: `orders/${orderId}`,
      })
      return response.body as ShopifyOrderData
    } catch (error) {
      console.error('Error fetching Shopify order:', error)
      return null
    }
  }

  async getOrders(limit: number = 50): Promise<ShopifyOrderData[]> {
    try {
      const client = new shopify.clients.Rest({ session: this.session })
      const response = await client.get({
        path: 'orders',
        query: { limit: limit.toString(), status: 'any' },
      })
      return (response.body as any).orders || []
    } catch (error) {
      console.error('Error fetching Shopify orders:', error)
      return []
    }
  }

  async createWebhook(topic: string, address: string) {
    try {
      const client = new shopify.clients.Rest({ session: this.session })
      const response = await client.post({
        path: 'webhooks',
        data: {
          webhook: {
            topic,
            address,
            format: 'json',
          },
        },
      })
      return response.body
    } catch (error) {
      console.error('Error creating webhook:', error)
      throw error
    }
  }

  async getWebhooks() {
    try {
      const client = new shopify.clients.Rest({ session: this.session })
      const response = await client.get({
        path: 'webhooks',
      })
      return (response.body as any).webhooks || []
    } catch (error) {
      console.error('Error fetching webhooks:', error)
      return []
    }
  }
} 