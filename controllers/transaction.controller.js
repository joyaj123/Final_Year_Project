import Transaction  from "../models/Transaction.js";
import mongoose from "mongoose";
import Investor from "../models/Investor.js";


export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({});
    res.status(200).json(transactions);
  } catch (error) {
    console.error("ERROR FETCHING TRANSACTIONS:", error);
    res.status(500).json({ message: error.message });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    console.error("ERROR CREATING TRANSACTION:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("investor")
      .populate("business")
      .populate("deal");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error("ERROR FETCHING TRANSACTION:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error("ERROR UPDATING TRANSACTION:", error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("ERROR DELETING TRANSACTION:", error);
    res.status(500).json({ message: error.message });
  }
};

const generateTransactionNumber = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TRANSACTION-${Date.now()}-${random}`;
};

// -------------------- DEPOSIT --------------------
export const depositToWallet = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      amount,
      currency = "USD",
      fee = 0,
      description,
      notes,
      paymentDetails = {},
    } = req.body;

    const amountValue = Number(amount);
    const feeValue = Number(fee);
    const currencyValue = String(currency).toUpperCase();

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    if (!Number.isFinite(feeValue) || feeValue < 0) {
      throw new Error("Fee must be a valid number >= 0");
    }

    if (!paymentDetails.method) {
      throw new Error("paymentDetails.method is required");
    }

    const netAmount = amountValue - feeValue;

    if (netAmount < 0) {
      throw new Error("Fee cannot be greater than amount");
    }

    const investor = await Investor.findOne({ userId: req.userId }).session(session);

    if (!investor) {
      throw new Error("Investor not found");
    }

    // initialise wallet si absent
    if (!investor.wallet) {
      investor.wallet = {
        balance: Number(0),
        currency: currencyValue,
        lockedBalance: Number(0),
        totalInvested: Number(0),
        totalReturns: Number(0),
      };
    }

    const currentBalance = Number(investor.wallet.balance?.toString() || 0);
    const walletCurrency = investor.wallet.currency || currencyValue;

    if (walletCurrency !== currencyValue) {
      throw new Error(`Wallet currency is ${walletCurrency}, not ${currencyValue}`);
    }

    const newBalance = currentBalance + netAmount;

    const createdTransactions = await Transaction.create(
      [
        {
          transactionNumber: generateTransactionNumber(),
          type: "DEPOSIT",
          status: "COMPLETED",
          senderId: null,
          senderType: "EXTERNAL",
          receiverId: investor._id,
          receiverType: "INVESTOR",
          amount: Number(amountValue),
          currency: currencyValue,
          fee: Number(feeValue),
          netAmount: Number(netAmount),

          paymentDetails: {
            method: paymentDetails.method,
            externalReference: paymentDetails.externalReference || null,
            bankName: paymentDetails.bankName || null,
            last4: paymentDetails.last4 || null,
            processorResponse: paymentDetails.processorResponse || null,
          },

          description: description || "Wallet deposit",
          notes: notes || null,
          ipAddress: req.ip || null,
          userAgent: req.get("user-agent") || null,
          completedAt: new Date(),
        },
      ],
      { session }
    );

    investor.wallet.balance = Number(newBalance);
    investor.wallet.currency = walletCurrency;

    await investor.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Deposit completed successfully",
      wallet: investor.wallet,
      transaction: createdTransactions[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(400).json({
      message: error.message,
    });
  }
};

// -------------------- WITHDRAW --------------------
export const withdrawFromWallet = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      amount,
      currency = "USD",
      fee = 0,
      description,
      notes,
      paymentDetails = {},
    } = req.body;

    const amountValue = Number(amount);
    const feeValue = Number(fee);
    const currencyValue = String(currency).toUpperCase();

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    if (!Number.isFinite(feeValue) || feeValue < 0) {
      throw new Error("Fee must be a valid number >= 0");
    }

    if (!paymentDetails.method) {
      throw new Error("paymentDetails.method is required");
    }

    const netAmount = amountValue - feeValue;

    if (netAmount < 0) {
      throw new Error("Fee cannot be greater than amount");
    }

    const investor = await Investor.findOne({ userId: req.userId }).session(session);

    if (!investor) {
      throw new Error("Investor not found");
    }

    if (!investor.wallet) {
      throw new Error("Wallet not found");
    }

    const currentBalance = Number(investor.wallet.balance?.toString() || 0);
    const walletCurrency = investor.wallet.currency || currencyValue;
    const lockedBalance = Number(investor.wallet.lockedBalance?.toString() || 0);

    if (walletCurrency !== currencyValue) {
      throw new Error(`Wallet currency is ${walletCurrency}, not ${currencyValue}`);
    }

    const availableBalance = currentBalance - lockedBalance;

    if (availableBalance < amountValue) {
      throw new Error("Insufficient available balance");
    }

    const newBalance = currentBalance - amountValue;

    const createdTransactions = await Transaction.create(
      [
        {
          transactionNumber: generateTransactionNumber(),
          type: "WITHDRAWAL",
          status: "COMPLETED",

          senderId: investor._id,
          senderType: "INVESTOR",
          receiverId: null,
          receiverType: "EXTERNAL",

          amount: Number(amountValue),
          currency: currencyValue,
          fee: Number(feeValue),
          netAmount: Number(netAmount),

          paymentDetails: {
            method: paymentDetails.method,
            externalReference: paymentDetails.externalReference || null,
            bankName: paymentDetails.bankName || null,
            last4: paymentDetails.last4 || null,
            processorResponse: paymentDetails.processorResponse || null,
          },

          description: description || "Wallet withdrawal",
          notes: notes || null,
          ipAddress: req.ip || null,
          userAgent: req.get("user-agent") || null,
          completedAt: new Date(),
        },
      ],
      { session }
    );

    investor.wallet.balance = Number(newBalance);

    await investor.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Withdrawal completed successfully",
      wallet: investor.wallet,
      transaction: createdTransactions[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(400).json({
      message: error.message,
    });
  }
};