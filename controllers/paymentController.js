const crypto = require('crypto');
const mongoose = require('mongoose');
const razorpay = require('../config/razorpay');
const Booking = require('../models/booking');
const Home = require('../models/home');
const User = require('../models/user');
const PaymentTransaction = require('../models/paymentTransaction');

/**
 * Helper: Calculate nights between two ISO date strings
 */
const calculateNights = (checkInStr, checkOutStr) => {
  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);
  
  // Set to midnight UTC for clean date diff
  const utc1 = Date.UTC(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
  const utc2 = Date.UTC(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
  
  const diffDays = Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

/**
 * Helper: Verify Razorpay Checkout signature
 */
const verifyCheckoutSignature = (orderId, paymentId, signature, secret) => {
  if (!orderId || !paymentId || !signature || !secret) return false;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'utf8'),
    Buffer.from(signature, 'utf8')
  );
};

/**
 * 1. Create Razorpay Order
 * POST /api/payments/create-order
 */
exports.createOrder = async (req, res) => {
  try {
    const { houseId, checkIn, checkOut, guests } = req.body;
    const userId = req.userId || req.session?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'You must be logged in to create a reservation.'
      });
    }

    if (!houseId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking details (houseId, checkIn, checkOut).'
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid check-in or check-out date format.'
      });
    }

    if (checkInDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past.'
      });
    }

    const nightCount = calculateNights(checkIn, checkOut);
    if (nightCount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be at least 1 day after check-in.'
      });
    }

    // Fetch home strictly from DB to calculate server-side price
    const home = await Home.findById(houseId);
    if (!home) {
      return res.status(404).json({
        success: false,
        message: 'The requested property was not found.'
      });
    }

    // SERVER-SIDE AMOUNT CALCULATION (Rule 1 & 2: Never trust client amount)
    const pricePerNight = home.price;
    const totalAmount = nightCount * pricePerNight;
    const amountInPaise = Math.round(totalAmount * 100);

    const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
    if (idempotencyKey) {
      const existingTx = await PaymentTransaction.findOne({ idempotencyKey, userId });
      if (existingTx) {
        const existingBooking = await Booking.findById(existingTx.bookingId).populate('houseId');
        if (existingBooking) {
          const user = await User.findById(userId).lean();
          return res.status(200).json({
            success: true,
            message: 'Existing order retrieved via Idempotency-Key.',
            keyId: process.env.RAZORPAY_KEY_ID,
            orderId: existingTx.razorpayOrderId,
            amount: Math.round(existingTx.amount * 100),
            currency: existingTx.currency,
            bookingId: existingBooking._id,
            propertyDetails: {
              houseName: existingBooking.houseId?.houseName || '',
              nightCount: existingBooking.nightCount,
              pricePerNight: existingBooking.pricePerNight,
              totalAmount: existingBooking.totalAmount
            },
            prefill: {
              name: user?.username || '',
              email: user?.email || ''
            }
          });
        }
      }
    }

    // Create a pending Booking in DB
    const booking = new Booking({
      houseId: home._id,
      userId: userId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: parseInt(guests) || 1,
      nightCount: nightCount,
      pricePerNight: pricePerNight,
      totalAmount: totalAmount,
      currency: 'INR',
      status: 'pending',
      paymentStatus: 'created'
    });

    await booking.save();

    // Create Razorpay Order
    const receiptId = `rcpt_${booking._id.toString().slice(-8)}_${Date.now().toString().slice(-4)}`;
    const razorpayOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        bookingId: booking._id.toString(),
        houseId: home._id.toString(),
        userId: userId.toString(),
        houseName: home.houseName
      }
    };

    const rzpInstance = razorpay.getRazorpayInstance();
    const razorpayOrder = await rzpInstance.orders.create(razorpayOptions);

    // Save Razorpay order ID to booking
    booking.razorpayOrderId = razorpayOrder.id;
    await booking.save();

    // Create initial PaymentTransaction record
    const transaction = new PaymentTransaction({
      bookingId: booking._id,
      userId: userId,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      currency: 'INR',
      status: 'created',
      idempotencyKey: idempotencyKey || razorpayOrder.id
    });
    await transaction.save();

    // Fetch user info for prefill
    const user = await User.findById(userId).lean();

    return res.status(201).json({
      success: true,
      message: 'Razorpay order created successfully.',
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount, // in paise
      currency: razorpayOrder.currency,
      bookingId: booking._id,
      propertyDetails: {
        houseName: home.houseName,
        nightCount: nightCount,
        pricePerNight: pricePerNight,
        totalAmount: totalAmount
      },
      prefill: {
        name: user?.username || '',
        email: user?.email || ''
      }
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    const detail = error.error?.description || error.description || error.message;
    let userMsg = 'Failed to create payment order.';
    if (detail && detail.toLowerCase().includes('key')) {
      userMsg = 'Razorpay Key Error: ' + detail + '. Please verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env';
    } else if (detail) {
      userMsg = detail;
    }

    return res.status(500).json({
      success: false,
      message: userMsg,
      error: error.message
    });
  }
};

/**
 * 2. Verify Payment (Client-side checkout modal completion)
 * POST /api/payments/verify-payment
 */
exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: 'Incomplete payment verification payload.'
    });
  }

  // 1. Cryptographic HMAC Signature Verification (Rule 4 & 5)
  let isSignatureValid = false;
  try {
    isSignatureValid = verifyCheckoutSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      secret
    );
  } catch (sigErr) {
    isSignatureValid = false;
  }

  if (!isSignatureValid) {
    // Record failed attempt
    await PaymentTransaction.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: 'failed',
        errorMessage: 'Invalid signature verification',
        razorpayPaymentId: razorpay_payment_id
      }
    );

    return res.status(400).json({
      success: false,
      message: 'Payment verification failed. Invalid signature.'
    });
  }

  // 2. Transaction-Safe Update
  let session = null;
  let useTransactions = true;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (e) {
    // Fallback if standalone MongoDB doesn't support replica set transactions
    useTransactions = false;
  }

  try {
    const bookingQuery = Booking.findOne({
      $or: [
        { _id: bookingId },
        { razorpayOrderId: razorpay_order_id }
      ]
    });

    const booking = useTransactions
      ? await bookingQuery.session(session)
      : await bookingQuery;

    if (!booking) {
      if (useTransactions) await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Associated booking not found.'
      });
    }

    // Idempotency check: if already confirmed, do not re-process
    if (booking.status === 'confirmed' && booking.paymentStatus === 'paid') {
      if (useTransactions) await session.commitTransaction();
      return res.status(200).json({
        success: true,
        message: 'Payment already confirmed.',
        redirectUrl: '/bookings'
      });
    }

    // Update booking status
    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;

    if (useTransactions) {
      await booking.save({ session });
    } else {
      await booking.save();
    }

    // Update or create payment transaction
    const txUpdate = {
      status: 'captured',
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature
    };

    if (useTransactions) {
      await PaymentTransaction.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        txUpdate,
        { session, new: true, upsert: true }
      );
      await session.commitTransaction();
    } else {
      await PaymentTransaction.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        txUpdate,
        { new: true, upsert: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Payment successfully verified and booking confirmed!',
      bookingId: booking._id,
      redirectUrl: '/bookings'
    });
  } catch (error) {
    if (useTransactions && session) await session.abortTransaction();
    console.error('Verify Payment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database update failed during payment verification.',
      error: error.message
    });
  } finally {
    if (session) session.endSession();
  }
};

/**
 * 3. Authoritative Razorpay Webhook Handler
 * POST /api/payments/webhook
 */
exports.handleWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (!webhookSecret) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not configured in .env');
    return res.status(500).send('Webhook secret is not configured.');
  }

  if (!signature) {
    return res.status(400).send('Missing X-Razorpay-Signature header.');
  }

  // Retrieve raw unparsed body (Rule 5)
  const rawBody = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);

  // Compute HMAC SHA256 Signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  let isWebhookValid = false;
  try {
    isWebhookValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf8'),
      Buffer.from(signature, 'utf8')
    );
  } catch (err) {
    isWebhookValid = false;
  }

  if (!isWebhookValid) {
    console.error('Razorpay Webhook: Invalid signature verification failed.');
    return res.status(400).json({ status: 'error', message: 'Invalid webhook signature.' });
  }

  const eventPayload = typeof req.body === 'object' ? req.body : JSON.parse(rawBody);
  const eventType = eventPayload.event;
  const eventId = eventPayload.account_id ? `${eventPayload.account_id}_${eventPayload.created_at}` : eventPayload.id || `evt_${Date.now()}`;

  console.log(`Razorpay Webhook received event: ${eventType}`);

  // Idempotency check: Check if this specific webhook event was already handled (Rule 6)
  if (eventPayload.id) {
    const existingTx = await PaymentTransaction.findOne({ webhookEventId: eventPayload.id });
    if (existingTx) {
      console.log(`Razorpay Webhook: Event ${eventPayload.id} already processed. Skipping.`);
      return res.status(200).json({ status: 'ok', message: 'Event already processed.' });
    }
  }

  let session = null;
  let useTransactions = true;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (e) {
    useTransactions = false;
  }

  try {
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = eventPayload.payload?.payment?.entity || {};
      const orderId = paymentEntity.order_id || eventPayload.payload?.order?.entity?.id;
      const paymentId = paymentEntity.id;
      const amountInINR = paymentEntity.amount ? paymentEntity.amount / 100 : 0;

      if (orderId) {
        // Update Booking
        const booking = useTransactions
          ? await Booking.findOne({ razorpayOrderId: orderId }).session(session)
          : await Booking.findOne({ razorpayOrderId: orderId });

        if (booking) {
          if (booking.status !== 'cancelled') {
            booking.status = 'confirmed';
            booking.paymentStatus = 'paid';
          }
          if (paymentId) booking.razorpayPaymentId = paymentId;
          
          if (useTransactions) {
            await booking.save({ session });
          } else {
            await booking.save();
          }
        }

        // Record Transaction
        const txData = {
          status: 'captured',
          razorpayPaymentId: paymentId,
          webhookEventId: eventPayload.id,
          webhookPayload: eventPayload
        };

        if (useTransactions) {
          await PaymentTransaction.findOneAndUpdate(
            { razorpayOrderId: orderId },
            txData,
            { session, new: true, upsert: true }
          );
          await session.commitTransaction();
        } else {
          await PaymentTransaction.findOneAndUpdate(
            { razorpayOrderId: orderId },
            txData,
            { new: true, upsert: true }
          );
        }
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = eventPayload.payload?.payment?.entity || {};
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const errorDesc = paymentEntity.error_description || 'Payment failed';

      if (orderId) {
        const booking = useTransactions
          ? await Booking.findOne({ razorpayOrderId: orderId }).session(session)
          : await Booking.findOne({ razorpayOrderId: orderId });

        if (booking && booking.status !== 'confirmed') {
          booking.status = 'failed';
          booking.paymentStatus = 'failed';
          
          if (useTransactions) {
            await booking.save({ session });
          } else {
            await booking.save();
          }
        }

        const txData = {
          status: 'failed',
          razorpayPaymentId: paymentId,
          errorMessage: errorDesc,
          webhookEventId: eventPayload.id,
          webhookPayload: eventPayload
        };

        if (useTransactions) {
          await PaymentTransaction.findOneAndUpdate(
            { razorpayOrderId: orderId },
            txData,
            { session, new: true, upsert: true }
          );
          await session.commitTransaction();
        } else {
          await PaymentTransaction.findOneAndUpdate(
            { razorpayOrderId: orderId },
            txData,
            { new: true, upsert: true }
          );
        }
      }
    }

    return res.status(200).json({ status: 'ok', received: true });
  } catch (error) {
    if (useTransactions && session) await session.abortTransaction();
    console.error('Webhook Processing Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  } finally {
    if (session) session.endSession();
  }
};
