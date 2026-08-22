import { test, describe } from 'node:test';
import assert from 'node:assert';
import { checkCafeAccess, type CafeSubscription } from '../subscription';

describe('Fair Usage & Subscription Access Engine', () => {
  test('should grant permanent access to free tier cafes without expiration', () => {
    const sub: CafeSubscription = {
      cafeId: 'test-cafe',
      plan: 'free',
      subscriptionAmount: 0,
      billingCycle: 'monthly',
      lastPaymentAt: null,
      nextPaymentDue: null,
      paymentStatus: 'free',
      isActive: true,
      suspendedReason: null,
    };

    const result = checkCafeAccess(sub);
    assert.strictEqual(result.allowed, true);
    assert.strictEqual(result.showWarning, false);
    assert.strictEqual(result.status, 'free');
  });

  test('should block access when cafe is suspended by super admin', () => {
    const sub: CafeSubscription = {
      cafeId: 'test-cafe-2',
      plan: 'pro',
      subscriptionAmount: 2499,
      billingCycle: 'monthly',
      lastPaymentAt: null,
      nextPaymentDue: null,
      paymentStatus: 'suspended',
      isActive: false,
      suspendedReason: 'Payment breach',
    };

    const result = checkCafeAccess(sub);
    assert.strictEqual(result.allowed, false);
    assert.strictEqual(result.status, 'suspended');
    assert.match(result.reason, /Payment breach/);
  });

  test('should allow active paid plans', () => {
    const futureDue = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString();
    const sub: CafeSubscription = {
      cafeId: 'test-cafe-3',
      plan: 'pro',
      subscriptionAmount: 2499,
      billingCycle: 'monthly',
      lastPaymentAt: new Date().toISOString(),
      nextPaymentDue: futureDue,
      paymentStatus: 'active',
      isActive: true,
      suspendedReason: null,
    };

    const result = checkCafeAccess(sub);
    assert.strictEqual(result.allowed, true);
    assert.strictEqual(result.showWarning, false);
    assert.strictEqual(result.status, 'active');
  });
});
