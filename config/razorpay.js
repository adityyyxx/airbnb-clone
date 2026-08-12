const Razorpay = require('razorpay');
require('dotenv').config();

const getRazorpayInstance = () => {
  const key_id = (process.env.RAZORPAY_KEY_ID || '').trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  return new Razorpay({
    key_id,
    key_secret
  });
};

module.exports = {
  getRazorpayInstance,
  getInstance: getRazorpayInstance
};
