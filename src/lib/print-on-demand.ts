import axios, { AxiosInstance } from 'axios'

export interface PODProduct {
  id: string
  quantity: number
}

export interface PODOrder {
  products: PODProduct[]
}

export interface PODOrderResponse {
  id?: string
  status?: string
  message?: string
}

export interface PODProductData {
  id: string
  name: string
  description?: string
  price?: number
  variants?: Array<{
    id: string
    name: string
    price: number
    sku?: string
  }>
}

export class PrintOnDemandService {
  private client: AxiosInstance

  constructor() {
    const baseURL = process.env.POD_API_URL || 'https://savitarna.amspauda.lt/api'
    const apiKey = process.env.POD_API_KEY

    if (!apiKey) {
      throw new Error('POD_API_KEY environment variable is required')
    }

    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Apikey ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds timeout
    })
  }

  /**
   * Create a new order in the print-on-demand system
   */
  async createOrder(order: PODOrder): Promise<PODOrderResponse> {
    try {
      const response = await this.client.post('/orders', order)
      return response.data
    } catch (error) {
      console.error('Error creating POD order:', error)
      if (axios.isAxiosError(error)) {
        throw new Error(`POD API Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`)
      }
      throw error
    }
  }

  /**
   * Get all orders from the print-on-demand system
   */
  async getOrders(): Promise<PODOrderResponse[]> {
    try {
      const response = await this.client.get('/orders')
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching POD orders:', error)
      if (axios.isAxiosError(error)) {
        throw new Error(`POD API Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`)
      }
      throw error
    }
  }

  /**
   * Get a specific order by ID from the print-on-demand system
   */
  async getOrder(orderId: string): Promise<PODOrderResponse | null> {
    try {
      const response = await this.client.get(`/orders/${orderId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching POD order ${orderId}:`, error)
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return null
        }
        throw new Error(`POD API Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`)
      }
      throw error
    }
  }

  /**
   * Get all products from the print-on-demand system
   */
  async getProducts(): Promise<PODProductData[]> {
    try {
      const response = await this.client.get('/products')
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching POD products:', error)
      if (axios.isAxiosError(error)) {
        throw new Error(`POD API Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`)
      }
      throw error
    }
  }

  /**
   * Transform Shopify order line items to POD products format
   */
  transformShopifyOrder(lineItems: Array<{ sku?: string, quantity: number, variant_id: number }>): PODProduct[] {
    return lineItems
      .filter(item => item.sku) // Only include items with SKU (assuming these are POD products)
      .map(item => ({
        id: item.sku!, // Use SKU as product ID for POD service
        quantity: item.quantity
      }))
  }

  /**
   * Check if an order contains print-on-demand products
   */
  async hasPODProducts(lineItems: Array<{ sku?: string }>): Promise<boolean> {
    try {
      // Get all POD products to check against
      const podProducts = await this.getProducts()
      const podProductIds = new Set(podProducts.map(p => p.id))
      
      // Check if any line item has a SKU that matches a POD product
      return lineItems.some(item => item.sku && podProductIds.has(item.sku))
    } catch (error) {
      console.error('Error checking for POD products:', error)
      // If we can't check, assume it might have POD products to be safe
      return true
    }
  }
} 