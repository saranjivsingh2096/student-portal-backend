const { createPaymentOrder, verifyPayment, getTransactionLog } = require("../controllers/transactionController");
const authenticateToken = require("../middlewares/authenticateToken");

module.exports = (app) => {
  app.post("/create-order", authenticateToken, createPaymentOrder);
  app.post("/verify-payment", authenticateToken, verifyPayment);
  app.get("/transaction-log-data", authenticateToken, getTransactionLog);
};
