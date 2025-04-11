import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jsonwebtoken from "jsonwebtoken";
import { UserModel } from "./model/user.model.js";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";

const app = express();
const PORT = 3251;
const MONGO_URI = "mongodb://localhost:27017/wibes-draw";
const JWT_SECRET = "wibes";

function generateVCard(name, phone) {
  const nameParts = name.trim().split(" ");
  const lastName = nameParts.pop();
  const firstName = nameParts.join(" ");

  return `
BEGIN:VCARD
VERSION:3.0
N:${lastName};${firstName};;;
FN:${name}
TEL;TYPE=CELL:${phone}
END:VCARD
`.trim();
}

// FOR LOGGING REQUESTS TO DEBUG
app.use((req, _, next) => {
  const info = req.method + " " + req.url;
  console.log(
    new Date().toISOString(),
    ":: API HIT ------->",
    info,
    "\n|\nv\n|\nv\n"
  );
  next();
});

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    exposedHeaders: "x-auth-token",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/users", async (req, res) => {
  try {
    const token = req.headers["Authorization"] || req.headers["authorization"];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const decoded = jsonwebtoken.verify(token, JWT_SECRET);
    if (!decoded?.id) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const users = await UserModel.find({}).select("-__v").lean();

    return res.status(200).json({
      message: "Users fetched successfully",
      data: users,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
});

app.post("/user", async (req, res) => {
  const { name, phone } = req.body;
  let user = null;
  try {
    user = await UserModel.findOne({ name, phone }).lean();

    if (!user) {
      user = (await UserModel.create({ name, phone })).toObject();
    }

    const token = jsonwebtoken.sign({ id: user._id }, JWT_SECRET);

    const outputFilePath = path.join(
      process.cwd(),
      `${user.name}_${user._id}.png`
    );

    if (!fs.existsSync(outputFilePath)) {
      await QRCode.toFile(
        outputFilePath,
        generateVCard(user.name, user.phone),
        {
          type: "png",
          errorCorrectionLevel: "H",
        }
      );
    }

    res.status(200).set({ "x-auth-token": token }).json({
      data: user,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message, success: false });
  }
});

const PRICE_MONEY = {
  "1-8": 1100,
  "9-16": 2200,
  "17-23": 3300,
  "24-36": 5000,
};

function getPriceForNumber(number) {
  for (const range in PRICE_MONEY) {
    const [start, end] = range.split("-").map(Number);
    if (number >= start && number <= end) {
      return PRICE_MONEY[range];
    }
  }
  return 0;
}

app.post("/number", async (req, res) => {
  const { number } = req.body;
  const token = req.headers["Authorization"] || req.headers["authorization"];

  try {
    const decoded = jsonwebtoken.verify(token, JWT_SECRET);

    const user = await UserModel.findOneAndUpdate(
      { _id: decoded.id },
      { number, priceMoney: getPriceForNumber(number) },
      { new: true }
    ).lean();

    res.status(200).json({
      data: user,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
});

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit the process with failure
  }
};

startServer();
