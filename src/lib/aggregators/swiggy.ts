export interface AggregatorOrder {
  id: string;
  platform: 'swiggy' | 'zomato' | 'magicpin';
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  totalAmount: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'dispatched' | 'cancelled';
  riderName?: string;
  riderPhone?: string;
  createdAt: string;
}

export function parseSwiggyWebhookPayload(payload: any): AggregatorOrder {
  return {
    id: `swiggy-${payload.order_id || Date.now()}`,
    platform: 'swiggy',
    orderId: payload.order_id || `SWG-${Math.floor(100000 + Math.random() * 900000)}`,
    customerName: payload.customer?.name || 'Swiggy Customer',
    customerPhone: payload.customer?.phone || '+91 98765 00000',
    deliveryAddress: payload.delivery_address || 'Bandra West, Mumbai',
    items: (payload.items || []).map((i: any) => ({
      id: i.item_id || String(Math.random()),
      name: i.name || 'Swiggy Dish',
      quantity: i.quantity || 1,
      price: i.price || 250,
    })),
    subtotal: payload.subtotal || 450,
    tax: payload.tax || 22.5,
    deliveryFee: payload.delivery_fee || 35,
    totalAmount: payload.total_amount || 507.5,
    status: 'pending',
    riderName: 'Ramesh (Swiggy Delivery Partner)',
    riderPhone: '+91 98765 99999',
    createdAt: new Date().toISOString(),
  };
}
