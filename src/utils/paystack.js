const axios = require('axios');

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
});

exports.initializeTransaction = async (email, amount, callback_url) => {
  const res = await paystack.post('/transaction/initialize', {
    email,
    amount,
    callback_url
  });
  return res.data;
};

exports.verifyTransaction = async (reference) => {
  const res = await paystack.get(`/transaction/verify/${reference}`);
  return res.data;
};
