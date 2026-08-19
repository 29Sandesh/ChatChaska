import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signToken, verifyToken } from '../auth';

describe('HMAC Authentication & Token Security', () => {
  it('should sign and verify valid session payloads', () => {
    const payload = {
      user: {
        id: 'user-test-123',
        name: 'Sandesh Owner',
        role: 'cafe_owner' as const,
        cafeId: 'cafe-chatchaska',
      },
      expiresAt: Date.now() + 1000 * 60 * 60, // 1 hour from now
    };

    const token = signToken(payload);
    assert.ok(token.includes('.'), 'Token must contain payload.signature separator');

    const verified = verifyToken(token);
    assert.ok(verified !== null, 'Token must verify successfully');
    assert.equal(verified?.user.id, 'user-test-123');
    assert.equal(verified?.user.role, 'cafe_owner');
  });

  it('should reject expired session tokens', () => {
    const expiredPayload = {
      user: {
        id: 'user-expired',
        name: 'Old Session',
        role: 'cashier' as const,
      },
      expiresAt: Date.now() - 5000, // 5 seconds in the past
    };

    const expiredToken = signToken(expiredPayload);
    const result = verifyToken(expiredToken);
    assert.equal(result, null, 'Expired tokens must return null');
  });

  it('should reject tampered or modified tokens', () => {
    const payload = {
      user: {
        id: 'user-normal',
        name: 'Normal User',
        role: 'cashier' as const,
      },
      expiresAt: Date.now() + 100000,
    };

    const token = signToken(payload);
    const [payloadBase64, signature] = token.split('.');
    
    // Create a modified payload by encoding different data
    const forgedPayload = Buffer.from(JSON.stringify({
      user: { id: 'user-hacker', name: 'Hacker', role: 'super_admin' },
      expiresAt: Date.now() + 100000,
    })).toString('base64url');

    // Combine forged payload with original signature
    const tampered = `${forgedPayload}.${signature}`;
    const result = verifyToken(tampered);
    assert.equal(result, null, 'Tampered token must fail HMAC verification');
  });
});
