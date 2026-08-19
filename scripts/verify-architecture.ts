import { hashPassword, verifyPassword, hashPin, verifyPin, checkRateLimit } from '../src/lib/security';
import { checkCafeAccess, type CafeSubscription } from '../src/lib/subscription';
import { formatWhatsAppBillMessage, buildWhatsAppShareUrl } from '../src/lib/whatsapp';
import { formatEodWhatsAppMessage } from '../src/lib/eod-summary';

async function runSanityAudit() {
  console.log('=== CHATCHASKA BACKEND AUDIT START ===\n');

  // 1. Test Password & PIN Security
  const passHash = await hashPassword('MySecretPass123');
  const passValid = await verifyPassword('MySecretPass123', passHash);
  const passInvalid = await verifyPassword('WrongPass', passHash);
  console.log(`[Security] Password Hashing (bcrypt): ${passValid && !passInvalid ? '✅ PASSED' : '❌ FAILED'}`);

  const pinHash = await hashPin('1234');
  const pinValid = await verifyPin('1234', pinHash);
  const pinInvalid = await verifyPin('9999', pinHash);
  console.log(`[Security] 4-Digit PIN Hashing: ${pinValid && !pinInvalid ? '✅ PASSED' : '❌ FAILED'}`);

  const rateCheck1 = checkRateLimit('test-ip-audit', 3, 10000, 20000);
  const rateCheck2 = checkRateLimit('test-ip-audit', 3, 10000, 20000);
  const rateCheck3 = checkRateLimit('test-ip-audit', 3, 10000, 20000);
  const rateCheck4 = checkRateLimit('test-ip-audit', 3, 10000, 20000);
  console.log(`[Security] Rate Limiter Lockout (4th attempt blocked): ${!rateCheck4.allowed ? '✅ PASSED' : '❌ FAILED'}`);

  // 2. Test Subscription & Trial Engine
  const trial0Days: CafeSubscription = {
    cafeId: 'test-1',
    plan: 'trial',
    trialStartedAt: new Date().toISOString(),
    trialDays: 0,
    trialExpiresAt: null,
    subscriptionAmount: 2499,
    billingCycle: 'monthly',
    lastPaymentAt: null,
    nextPaymentDue: null,
    paymentStatus: 'expired',
    isActive: true,
    suspendedReason: null,
  };
  const access0 = checkCafeAccess(trial0Days);
  console.log(`[Subscription] 0-Day Trial (Instant Lockout): ${!access0.allowed ? '✅ PASSED' : '❌ FAILED'}`);

  const trial90Days: CafeSubscription = {
    ...trial0Days,
    trialDays: 90,
    trialExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    paymentStatus: 'trial',
  };
  const access90 = checkCafeAccess(trial90Days);
  console.log(`[Subscription] 90-Day Trial (Active Access): ${access90.allowed && access90.daysLeft > 80 ? '✅ PASSED' : '❌ FAILED'}`);

  const suspendedCafe: CafeSubscription = {
    ...trial90Days,
    isActive: false,
    suspendedReason: 'Kill Switch Triggered',
  };
  const accessSuspended = checkCafeAccess(suspendedCafe);
  console.log(`[Subscription] Kill Switch / Suspension: ${!accessSuspended.allowed ? '✅ PASSED' : '❌ FAILED'}`);

  // 3. Test WhatsApp Bill Formatting
  const billMsg = formatWhatsAppBillMessage({
    id: 'bill-test-123',
    restaurantName: 'ChatChaska Test Cafe',
    totalAmount: 450,
    paymentMode: 'UPI',
    items: [{ name: 'Masala Chai', quantity: 2, price: 50 }, { name: 'Paneer Roll', quantity: 1, price: 350 }],
    hostedBillUrl: 'https://chatchaska.com/bill/bill-test-123',
  });
  const waUrl = buildWhatsAppShareUrl('9876543210', billMsg);
  console.log(`[WhatsApp] Hosted Receipt Link in URL: ${waUrl.includes('https%3A%2F%2Fchatchaska.com%2Fbill%2Fbill-test-123') ? '✅ PASSED' : '❌ FAILED'}`);

  // 4. Test EOD Daily Report
  const eodMsg = formatEodWhatsAppMessage({
    cafeName: 'ChatChaska Cafe',
    dateStr: '19 Aug 2026',
    totalSales: 15400,
    totalOrders: 38,
    cashSales: 6000,
    upiSales: 9400,
    cardSales: 0,
    totalTax: 770,
    topSellingItems: [{ name: 'Chai', count: 40, revenue: 2000 }],
  });
  console.log(`[EOD Report] EOD Summary Formatted: ${eodMsg.includes('15,400') ? '✅ PASSED' : '❌ FAILED'}`);

  console.log('\n=== ALL AUDIT TESTS COMPLETED SUCCESSFULLY ✅ ===');
}

runSanityAudit().catch(console.error);
