import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import razorpay from "razorpay";
import transactionModel from "../models/transactionModel.js";

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token, user: { name: user.name } });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User Doesn't Exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      res.json({ success: true, token, user: { name: user.name } });
    } else {
      return res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const userCredits = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId);
    res.json({
      success: true,
      credits: user.creditBalance,
      user: { name: user.name },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentRazorpay = async (req, res) => {
  try {
    const userId = req.userId;
    const { planId } = req.body;

    if (!userId || !planId) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    let credits, plan, amount;
    switch (planId) {
      case "Basic":
        plan = "Basic";
        credits = 20;
        amount = 10;
        break;
      case "Advanced":
        plan = "Advanced";
        credits = 250;
        amount = 50;
        break;
      case "Business":
        plan = "Business";
        credits = 500;
        amount = 250;
        break;
      default:
        return res.json({ success: false, message: "Plan not found" });
    }

    const transactionData = await transactionModel.create({
      userId,
      plan,
      amount,
      credits,
      date: new Date(),
      payment: false,
    });

    const options = {
      amount: amount * 100,
      currency: process.env.CURRENCY || "INR",
      receipt: String(transactionData._id),
    };

    const order = await razorpayInstance.orders.create(options);

    // 🔁 Save Razorpay Order ID to transaction
    await transactionModel.findByIdAndUpdate(transactionData._id, {
      orderId: order.id,
    });

    res.json({ success: true, order });
  } catch (error) {
    console.error("Razorpay error:", error);
    res.status(500).json({
      success: false,
      message: error?.description || "Payment initiation failed",
    });
  }
};

const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;

    // Fetch Razorpay order info
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (!orderInfo || orderInfo.status !== "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Payment not completed" });
    }

    // Use orderId instead of receipt for fetching transaction
    const transactionData = await transactionModel.findOne({
      orderId: razorpay_order_id,
    });

    if (!transactionData) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    if (transactionData.payment) {
      return res
        .status(400)
        .json({ success: false, message: "Payment already verified" });
    }

    const userData = await userModel.findById(transactionData.userId);
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const updatedCredits =
      (userData.creditBalance || 0) + transactionData.credits;

    await userModel.findByIdAndUpdate(userData._id, {
      creditBalance: updatedCredits,
    });

    await transactionModel.findByIdAndUpdate(transactionData._id, {
      payment: true,
    });

    res
      .status(200)
      .json({ success: true, message: "Credits added successfully" });
  } catch (error) {
    console.error("Razorpay verification error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export {
  registerUser,
  loginUser,
  userCredits,
  paymentRazorpay,
  verifyRazorpay,
};
