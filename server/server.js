import express from "express";
import cors from "cors";
import "dotenv/config";
import dotenv from "dotenv";
import connectDB from "./config/mongodb.js";
import userRouter from "./routes/userRoutes.js";
import imageRouter from "./routes/imageRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();

app.use(express.json());

// ✅ Updated CORS Configuration
const corsOptions = {
  origin: "https://imagify-frontend-fn6o.onrender.com",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token"], // ✅ Added "token"
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ✅ Preflight handling

// ✅ Connect to MongoDB
await connectDB();

// ✅ Define Routes
app.use("/api/user", userRouter);
app.use("/api/image", imageRouter);

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("Hi");
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log("Server Running on the PORT " + PORT);
});
