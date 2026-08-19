import { AggregatorOrder } from './swiggy';

export function parseZomatoWebhookPayload(payload: any): AggregatorOrder {
  return {
    id: `zomato-${payload.order_id || Date.now()}`,
    platform: 'zomato',
    orderId: payload.order_id || `ZOM-${Math.floor(100000 + Math.random() * 900000)}`,
    customerName: payload.customer?.name || 'Zomato Customer',
    customerPhone: payload.customer?.phone || '+91 98765 11111',
    deliveryAddress: payload.delivery_address || 'Pali Hill, Bandra West, Mumbai',
    items: (payload.items || []).map((i: any) => ({
      id: i.item_id || String(Math.random()),
      name: i.name || 'Zomato Dish',
      quantity: i.quantity || 1,
      price: i.price || 300,
    })),
    subtotal: payload.subtotal || 550,
    tax: payload.tax || 27.5,
    deliveryFee: payload.delivery_fee || 40,
    totalAmount: payload.total_amount || 617.5,
    status: 'pending',
    riderName: 'Vikram (Zomato Valet)',
    riderPhone: '+91 98765 88888',
    createdAt: new Date().toISOString(),
  };
}
