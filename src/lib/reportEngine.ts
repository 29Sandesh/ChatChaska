import { getAllBills, getAllOrders, getInventoryItems, getWasteLogs, getAllStaff } from '@/lib/database';

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export function generateSalesReport(filter: DateRangeFilter = {}) {
  const bills = getAllBills('paid');

  const totalRevenue = bills.reduce((sum, b) => sum + b.grandTotal, 0);
  const totalOrders = bills.length;
  const avgBillValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Payment mode breakdown
  const paymentBreakdown = {
    cash: bills.filter((b) => b.paymentMode === 'cash').reduce((sum, b) => sum + b.grandTotal, 0),
    upi: bills.filter((b) => b.paymentMode === 'upi').reduce((sum, b) => sum + b.grandTotal, 0),
    card: bills.filter((b) => b.paymentMode === 'card').reduce((sum, b) => sum + b.grandTotal, 0),
    split: bills.filter((b) => b.paymentMode === 'split').reduce((sum, b) => sum + b.grandTotal, 0),
  };

  // Waiter performance
  const waiterMap: Record<string, { orders: number; revenue: number }> = {};
  bills.forEach((b) => {
    const waiter = b.waiterName || 'Staff';
    if (!waiterMap[waiter]) {
      waiterMap[waiter] = { orders: 0, revenue: 0 };
    }
    waiterMap[waiter].orders += 1;
    waiterMap[waiter].revenue += b.grandTotal;
  });

  // Item bestsellers
  const itemMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
  bills.forEach((b) => {
    b.items.forEach((item) => {
      if (!itemMap[item.name]) {
        itemMap[item.name] = { name: item.name, quantity: 0, revenue: 0 };
      }
      itemMap[item.name].quantity += item.quantity;
      itemMap[item.name].revenue += item.lineTotal;
    });
  });

  const bestsellers = Object.values(itemMap).sort((a, b) => b.quantity - a.quantity);

  // GST Tax Summary
  const totalCGST = bills.reduce((sum, b) => sum + (b.cgstAmount || 0), 0);
  const totalSGST = bills.reduce((sum, b) => sum + (b.sgstAmount || 0), 0);
  const totalGST = totalCGST + totalSGST;

  return {
    totalRevenue,
    totalOrders,
    avgBillValue,
    paymentBreakdown,
    waiterPerformance: Object.entries(waiterMap).map(([name, stat]) => ({ name, ...stat })),
    bestsellers,
    gstSummary: { totalCGST, totalSGST, totalGST },
  };
}

export function generateInventoryReport() {
  const stockItems = getInventoryItems();
  const wasteLogs = getWasteLogs();

  const totalStockItems = stockItems.length;
  const lowStockItems = stockItems.filter((i) => i.currentStock <= i.minStock);
  const totalWastageCost = wasteLogs.reduce((sum, w) => sum + w.costValue, 0);

  return {
    totalStockItems,
    lowStockItemsCount: lowStockItems.length,
    lowStockItems,
    totalWastageCost,
    wasteLogs,
  };
}
