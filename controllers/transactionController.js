const { FeeDetails, TransactionLogData, User } = require("../models");
const { razorpayClient } = require("../utils/razorpay");

const createPaymentOrder = async (req, res) => {
  const userKey = req.body.user;

  if (!userKey) {
    return res.status(400).json({ message: "User key is missing." });
  }

  try {
    const user = await User.findOne({ where: { username: userKey } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const feeDetails = await FeeDetails.findAll({
      where: {
        paid: false,
        UserId: user.id,
      },
    });

    if (feeDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "No unpaid fees available for payment." });
    }

    const totalAmount = feeDetails.reduce(
      (sum, fee) => sum + fee.amountToPay,
      0
    );

    const order = await razorpayClient.orders.create({
      amount: totalAmount * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_${user.id}_${Date.now()}`,
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifyPayment = async (req, res) => {
  const { paymentId, orderId, amount } = req.body;
  const user = req.query.user;
  const studentId = req.query.studentId;

  if (!user) {
    return res.status(400).json({ message: "User key is missing." });
  }

  try {
    const dbUser = await User.findOne({ where: { username: user } });

    if (!dbUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const order = await razorpayClient.orders.fetch(orderId);

    if (!order || order.amount !== amount) {
      return res
        .status(400)
        .json({ message: "Order amount mismatch or order not found." });
    }

    const unpaidFees = await FeeDetails.findAll({
      where: { UserId: dbUser.id, paid: false },
    });

    if (unpaidFees.length === 0) {
      return res
        .status(404)
        .json({ message: "No unpaid fees found for this user." });
    }

    for (const fee of unpaidFees) {
      fee.paid = true;
      await fee.save();
    }

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
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified and fees updated successfully.",
      updatedFeeDetails,
      transactionLog,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getTransactionLog = async (req, res) => {
  const userKey = req.query.user;

  if (!userKey) {
    return res.status(400).json({ message: "User key is missing." });
  }

  try {
    const user = await User.findOne({ where: { username: userKey } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const transactionLogData = await TransactionLogData.findAll({
      where: { UserId: user.id },
    });

    if (transactionLogData.length === 0) {
      return res
        .status(404)
        .json({ message: "No transaction log data found for this user." });
    }

    const filteredTransactionLogData = transactionLogData.map((item) => {
      const { id, UserId, ...rest } = item.dataValues;
      return {
        ...rest,
        bankTransactionId: rest.bankTransactionId.trim(),
        totalAmount: rest.totalAmount.trim(),
        paymentStatus: rest.paymentStatus.trim(),
        transactionDate: rest.transactionDate.trim(),
        paymentGateway: rest.paymentGateway.trim(),
      };
    });

    return res.status(200).json(filteredTransactionLogData);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createPaymentOrder, verifyPayment, getTransactionLog };
