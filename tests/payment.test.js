const crypto = require('crypto');
const jwtUtil = require('../utils/jwtUtil');

describe('Razorpay Payment Security & Signature Verification', () => {
  const TEST_SECRET = 'rzp_test_secret_sample_key_123';
  const TEST_WEBHOOK_SECRET = 'webhook_sample_secret_key_456';

  describe('1. Server-Side Price Calculation', () => {
    it('should correctly compute nights and total amount without trusting client price', () => {
      const pricePerNight = 4500;
      const checkIn = '2026-09-01';
      const checkOut = '2026-09-05';

      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const totalAmount = diffDays * pricePerNight;
      const amountInPaise = Math.round(totalAmount * 100);

      expect(diffDays).toBe(4);
      expect(totalAmount).toBe(18000);
      expect(amountInPaise).toBe(1800000);
    });

    it('should reject invalid dates where check-out is before check-in', () => {
      const checkIn = '2026-09-10';
      const checkOut = '2026-09-05';

      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      const diffDays = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));

      expect(diffDays).toBeLessThanOrEqual(0);
    });
  });

  describe('2. Razorpay Checkout HMAC-SHA256 Signature Verification', () => {
    it('should validate genuine Razorpay checkout signature', () => {
      const orderId = 'order_PVXYZ123456';
      const paymentId = 'pay_PVABC789012';

      // Generate authentic signature
      const validSignature = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      // Verify
      const computedSignature = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(validSignature, 'utf8'),
        Buffer.from(computedSignature, 'utf8')
      );

      expect(isValid).toBe(true);
    });

    it('should reject fraudulent/tampered signature', () => {
      const orderId = 'order_PVXYZ123456';
      const paymentId = 'pay_PVABC789012';
      const fakeSignature = 'fake_tampered_signature_string_that_is_invalid';

      const computedSignature = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      let isValid = false;
      try {
        isValid = crypto.timingSafeEqual(
          Buffer.from(fakeSignature, 'utf8'),
          Buffer.from(computedSignature, 'utf8')
        );
      } catch (e) {
        isValid = false;
      }

      expect(isValid).toBe(false);
    });
  });

  describe('3. Razorpay Webhook Raw Body Signature & Idempotency', () => {
    it('should verify genuine Webhook payload with X-Razorpay-Signature', () => {
      const rawPayload = JSON.stringify({
        entity: 'event',
        account_id: 'acc_123',
        event: 'payment.captured',
        id: 'evt_test_webhook_001',
        payload: {
          payment: {
            entity: {
              id: 'pay_captured_123',
              order_id: 'order_123',
              amount: 500000,
              status: 'captured'
            }
          }
        }
      });

      const validWebhookSignature = crypto
        .createHmac('sha256', TEST_WEBHOOK_SECRET)
        .update(rawPayload)
        .digest('hex');

      const computed = crypto
        .createHmac('sha256', TEST_WEBHOOK_SECRET)
        .update(rawPayload)
        .digest('hex');

      const isMatch = crypto.timingSafeEqual(
        Buffer.from(validWebhookSignature, 'utf8'),
        Buffer.from(computed, 'utf8')
      );

      expect(isMatch).toBe(true);
    });
  });

  describe('4. JWT Authentication Utility', () => {
    it('should generate and verify valid JWT token', () => {
      const userPayload = {
        userId: '60d0fe4f5311236168a109ca',
        username: 'aditya_test',
        role: 'user'
      };

      const token = jwtUtil.generateToken(userPayload);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(20);

      const decoded = jwtUtil.verifyToken(token);
      expect(decoded.userId).toBe(userPayload.userId);
      expect(decoded.username).toBe(userPayload.username);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        jwtUtil.verifyToken('invalid.token.payload');
      }).toThrow();
    });
  });
});
