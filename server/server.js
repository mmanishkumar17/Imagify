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

app.use(
  cors({
    origin: "https://imagify-frontend-fn6o.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors()); // Handle preflight

await connectDB();

app.use("/api/user", userRouter);
app.use("/api/image", imageRouter);

app.get("/", (req, res) => {
  res.send("Hi");
});

app.listen(PORT, () => {
  console.log("Server Running on the PORT " + PORT);
});
