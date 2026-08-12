const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const jwtAuth = require('../middleware/jwtAuth');

// 1. Create Order (requires auth - JWT or Session)
router.post('/create-order', jwtAuth, paymentController.createOrder);

// 2. Verify Client Payment (requires auth - JWT or Session)
router.post('/verify-payment', jwtAuth, paymentController.verifyPayment);

// 3. Webhook Endpoint (public, verified via HMAC SHA256 header)
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
