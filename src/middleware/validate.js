// src/middleware/validate.js

function validateMinimumDeposit(minAmount) {
  return (req, res, next) => {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Amount must be a valid number' });
    }

    if (Number(amount) < minAmount) {
      return res.status(400).json({ error: `Minimum deposit is $${minAmount}` });
    }

    next();
  };
}

module.exports = {
  validateMinimumDeposit
};
