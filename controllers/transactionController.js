const { FeeDetails, TransactionLogData, User } = require("../models");
const { razorpayClient } = require("../utils/razorpay");

const createPaymentOrder = async (req, res) => {
  let userKey = req.body.user;
  if (!userKey) return res.status(400).json({ message: "User key is missing." });
  userKey = userKey.toLowerCase();
  try {
    const user = await User.findOne({ where: { username: userKey } });
    if (!user) return res.status(404).json({ message: "User not found." });
    const feeDetails = await FeeDetails.findAll({
      where: { paid: false, UserId: user.id, },
      attributes: ['id', 'amountToPay', 'feeType']
    });
    if (feeDetails.length === 0) {
      return res.status(404).json({ message: "No unpaid fees available for payment." });
    }
    const totalAmount = feeDetails.reduce((sum, fee) => sum + fee.amountToPay, 0);
    const order = await razorpayClient.orders.create({
      amount: totalAmount * 100, 
      currency: "INR",
      receipt: `receipt_${user.id}_${Date.now()}`,
    });
    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      feeDetails: feeDetails.map(fee => ({ id: fee.id, feeType: fee.feeType, amount: fee.amountToPay }))
    });
  } catch (error) {
    console.error("Error in createPaymentOrder:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifyPayment = async (req, res) => {
  const { paymentId, orderId, amount } = req.body;
  let userKey = req.query.user; 
  const studentId = req.query.studentId; 
  if (!userKey) return res.status(400).json({ message: "User key is missing." });
  userKey = userKey.toLowerCase();
  try {
    const dbUser = await User.findOne({ where: { username: userKey } });
    if (!dbUser) return res.status(404).json({ message: "User not found." });
    const order = await razorpayClient.orders.fetch(orderId);
    if (!order || order.amount !== amount) {
      return res.status(400).json({ message: "Order amount mismatch or order not found." });
    }
    const unpaidFees = await FeeDetails.findAll({
      where: { UserId: dbUser.id, paid: false },
      attributes: ['id', 'feeType', 'amountToPay', 'paid']
    });
    if (unpaidFees.length === 0) {
      return res.status(404).json({ message: "No unpaid fees found for this user." });
    }
    const feeIds = unpaidFees.map(fee => fee.id);
    await FeeDetails.update({ paid: true }, { where: { id: feeIds } });
    const transactionLog = await TransactionLogData.create({
      studentId,
      srmTransactionId: order.id,
      bankTransactionId: paymentId,
      totalAmount: (amount / 100).toFixed(2),
      paymentStatus: "Success",
      transactionDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '/'),
      paymentGateway: "Razorpay",
      UserId: dbUser.id,
    });
    const updatedFeeDetails = await FeeDetails.findAll({
      where: { paid: false, UserId: dbUser.id },
      attributes: ['id', 'feeType', 'amountToPay', 'yearMonth']
    });
    return res.status(200).json({
      success: true,
      message: "Payment verified and fees updated successfully.",
      updatedFeeDetails,
      transactionSummary: { id: transactionLog.id, amount: transactionLog.totalAmount, date: transactionLog.transactionDate, paymentId: transactionLog.bankTransactionId }
    });
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getTransactionLog = async (req, res) => {
  let userKey = req.query.user;
  if (!userKey) return res.status(400).json({ message: "User key is missing." });
  userKey = userKey.toLowerCase();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  try {
    const user = await User.findOne({ where: { username: userKey } });
    if (!user) return res.status(404).json({ message: "User not found." });
    const totalCount = await TransactionLogData.count({ where: { UserId: user.id } });
    const transactionLogData = await TransactionLogData.findAll({
      where: { UserId: user.id },
      attributes: [
        'studentId', 'srmTransactionId', 'bankTransactionId', 'totalAmount', 
        'paymentStatus', 'transactionDate', 'paymentGateway'
      ],
      order: [['transactionDate', 'DESC']],
      limit,
      offset
    });
    if (transactionLogData.length === 0 && page === 1) {
      return res.status(404).json({ message: "No transaction log data found for this user." });
    }
    const filteredTransactionLogData = transactionLogData.map((item) => ({
      ...item.dataValues,
      bankTransactionId: item.bankTransactionId.trim(),
      totalAmount: item.totalAmount.trim(),
      paymentStatus: item.paymentStatus.trim(),
      transactionDate: item.transactionDate, 
      paymentGateway: item.paymentGateway.trim(),
    }));
    const reversedTransactions = filteredTransactionLogData.reverse();
    const response = {
      transactions: reversedTransactions
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getTransactionLog:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createPaymentOrder, verifyPayment, getTransactionLog };
