const { createPaymentOrder, verifyPayment, getTransactionLog } = require("../controllers/transactionController");
const authenticateToken = require("../middlewares/authenticateToken");

module.exports = (app) => {
  app.post("/payment/create-order", authenticateToken, createPaymentOrder);
  app.post("/payment/verify-payment", authenticateToken, verifyPayment);
  app.get("/payment/transaction-log-data", authenticateToken, getTransactionLog);
};
