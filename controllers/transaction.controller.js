import Transaction  from "../models/Transaction.js";
import Company from "../models/company.js";
import Investor from "../models/Investor.js";
import mongoose from "mongoose";


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




export const getMyTransactions = async (req, res) => {
  try {
    const userId = req.userId;

    const company = await Company.findOne({ ownerId: userId });
    const investor = await Investor.findOne({ userId });

    const conditions = [];

    if (company) {
      conditions.push(
        { senderId: company._id, senderType: "COMPANY" },
        { receiverId: company._id, receiverType: "COMPANY" }
      );
    }

    if (investor) {
      conditions.push(
        { senderId: investor._id, senderType: "INVESTOR" },
        { receiverId: investor._id, receiverType: "INVESTOR" }
      );
    }

    if (!conditions.length) {
      return res.status(404).json({
        message: "No wallet owner found for this user",
      });
    }

    const transactions = await Transaction.find({
      $or: conditions,
    })
      .populate("dealId", "title dealNumber")
      .populate("distributionId", "distributionNumber type")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Transactions fetched successfully",
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("ERROR FETCHING USER TRANSACTIONS:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const withdrawFromWallet = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, paymentDetails = {}, description, notes } = req.body;

    const amountValue = Number(amount);
    const currency = "USD";

    if (!amountValue || amountValue <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    if (!paymentDetails.method) {
      throw new Error("Payment method is required");
    }

    let walletOwner = await Company.findOne({ ownerId: req.userId }).session(session);
    let ownerType = "COMPANY";
    let defaultDescription = "Company wallet withdrawal";

    if (!walletOwner) {
      walletOwner = await Investor.findOne({ userId: req.userId }).session(session);
      ownerType = "INVESTOR";
      defaultDescription = "Investor wallet withdrawal";
    }

    if (!walletOwner) {
      throw new Error("Company or investor wallet owner not found");
    }

    const currentBalance = Number(walletOwner.wallet?.balance?.toString() || 0);
    const lockedBalance = Number(walletOwner.wallet?.lockedBalance?.toString() || 0);
    const availableBalance = currentBalance - lockedBalance;

    if (availableBalance < amountValue) {
      throw new Error("Insufficient available balance");
    }

    const newBalance = currentBalance - amountValue;

    const transaction = await Transaction.create(
      [
        {
          transactionNumber:
            "TXN-" + Date.now() + "-" + Math.floor(Math.random() * 1000),

          type: "WITHDRAWAL",
          status: "COMPLETED",

          senderId: walletOwner._id,
          senderType: ownerType,

          receiverId: null,
          receiverType: "EXTERNAL",

          amount: mongoose.Types.Decimal128.fromString(amountValue.toString()),
          currency,

          fee: mongoose.Types.Decimal128.fromString("0"),
          netAmount: mongoose.Types.Decimal128.fromString(amountValue.toString()),

          paymentDetails: {
            method: paymentDetails.method,
            externalReference: paymentDetails.externalReference || "",
            bankName: paymentDetails.bankName || "",
            last4: paymentDetails.last4 || "",
          },

          description: description || defaultDescription,
          notes: notes || "",
          completedAt: new Date(),
        },
      ],
      { session }
    );

    walletOwner.wallet.balance = mongoose.Types.Decimal128.fromString(
      newBalance.toString()
    );

    walletOwner.markModified("wallet");
    await walletOwner.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Withdrawal completed successfully",
      ownerType,
      wallet: walletOwner.wallet,
      transaction: transaction[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(400).json({
      message: error.message,
    });
  }
};


const generateTransactionNumber = () => {
  return "TXN-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
};

const toDecimal128 = (value) => {
  return mongoose.Types.Decimal128.fromString(Number(value).toString());
};

// -------------------- DEPOSIT TO WALLET: COMPANY OR INVESTOR --------------------
export const depositToWallet = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      amount,
      fee = 0,
      description,
      notes,
      paymentDetails = {},
    } = req.body;

    const amountValue = Number(amount);
    const feeValue = Number(fee);
    const currencyValue = "USD";

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    if (!Number.isFinite(feeValue) || feeValue < 0) {
      throw new Error("Fee must be a valid number greater than or equal to 0");
    }

    if (feeValue > amountValue) {
      throw new Error("Fee cannot be greater than amount");
    }

    if (!paymentDetails.method) {
      throw new Error("Payment method is required");
    }

    let walletOwner = await Company.findOne({ ownerId: req.userId }).session(session);
    let ownerType = "COMPANY";
    let defaultDescription = "Company wallet deposit";

    if (!walletOwner) {
      walletOwner = await Investor.findOne({ userId: req.userId }).session(session);
      ownerType = "INVESTOR";
      defaultDescription = "Investor wallet deposit";
    }

    if (!walletOwner) {
      throw new Error("Company or investor wallet owner not found");
    }

    if (!walletOwner.wallet) {
      walletOwner.wallet = {
        balance: toDecimal128(0),
        currency: "USD",
        lockedBalance: toDecimal128(0),
        totalInvested: toDecimal128(0),
        totalReturns: toDecimal128(0),
      };
    }

    const currentBalance = Number(walletOwner.wallet.balance?.toString() || 0);
    const walletCurrency = walletOwner.wallet.currency || "USD";

    if (walletCurrency !== currencyValue) {
      throw new Error(`Wallet currency is ${walletCurrency}, not USD`);
    }

    const netAmount = amountValue - feeValue;
    const newBalance = currentBalance + netAmount;

    const createdTransactions = await Transaction.create(
      [
        {
          transactionNumber: generateTransactionNumber(),
          type: "DEPOSIT",
          status: "COMPLETED",

          senderId: null,
          senderType: "EXTERNAL",

          receiverId: walletOwner._id,
          receiverType: ownerType,

          amount: toDecimal128(amountValue),
          currency: currencyValue,
          fee: toDecimal128(feeValue),
          netAmount: toDecimal128(netAmount),

          paymentDetails: {
            method: paymentDetails.method,
            externalReference: paymentDetails.externalReference || null,
            bankName: paymentDetails.bankName || null,
            last4: paymentDetails.last4 || null,
            processorResponse: paymentDetails.processorResponse || null,
          },

          description: description || defaultDescription,
          notes: notes || null,
          ipAddress: req.ip || null,
          userAgent: req.get("user-agent") || null,
          completedAt: new Date(),
        },
      ],
      { session }
    );

    walletOwner.wallet.balance = toDecimal128(newBalance);
    walletOwner.wallet.currency = "USD";

    walletOwner.markModified("wallet");
    await walletOwner.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Deposit completed successfully",
      ownerType,
      wallet: walletOwner.wallet,
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