export type Role = 'ADMIN' | 'CUSTOMER';
export type OrderStatus = 'ORDER_RECEIVED' | 'PREPARING' | 'COOKING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export interface AuthSession { user: { id: string; name: string; email: string; role: Role }; accessToken: string; refreshToken: string }
export interface Category { id: string; name: string; slug: string; description?: string }
export interface MenuItem { id: string; categoryId: string; category: Category; name: string; slug: string; description: string; price: string; imageUrl: string; isAvailable: boolean }
export interface OrderItem { id: string; menuItemId: string; quantity: number; unitPrice: string; lineTotal: string; menuItem: MenuItem }
export interface Order { id: string; orderNumber: string; customerName: string; phone: string; address: string; city: string; state: string; zipCode: string; instructions?: string; status: OrderStatus; subtotal: string; deliveryFee: string; tax: string; total: string; estimatedDeliveryAt: string; createdAt: string; items: OrderItem[]; statusHistory: { id: string; status: OrderStatus; note: string; createdAt: string }[] }
export interface DashboardStats { totalOrders: number; revenue: number; pendingOrders: number; completedOrders: number; byStatus: { status: OrderStatus; count: number }[]; revenueSeries: { date: string; total: number }[] }
