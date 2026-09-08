const Razorpay = require('razorpay');
require('dotenv').config();

let instance = null;

const getRazorpayInstance = () => {
  if (!instance) {
    const key_id = (process.env.RAZORPAY_KEY_ID || '').trim();
    const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

    instance = new Razorpay({
      key_id,
      key_secret
    });
  }
  return instance;
};

module.exports = {
  getRazorpayInstance,
  getInstance: getRazorpayInstance
};
