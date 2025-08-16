// smm-backend/src/utils/currencyConverter.js
const rates = {
  GHS: 1,
  NGN: 66,
  KES: 12,
  USD: 0.085,
  GBP: 0.065,
  EUR: 0.075,
};

function convertCurrency(amount, from = 'GHS', to = 'GHS') {
  if (!rates[from] || !rates[to]) return amount;
  const base = amount / rates[from]; // Convert to base (GHS)
  return Math.round(base * rates[to] * 100) / 100;
}

module.exports = { convertCurrency };
