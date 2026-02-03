// 🔥 確認你跑的是這個檔案
console.log("🔥 SERVER.JS IS RUNNING FROM C:\\projects");

// ✅ 修 Windows DNS（非常重要）
require("dns").setDefaultResultOrder("ipv4first");

// ✅ 讀取環境變數
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// ===== 基本設定 =====
const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

console.log("ENV LOADED");
console.log("MONGO_URI =", process.env.MONGO_URI);

// ===== MongoDB 連線 =====
console.log("BEFORE MONGOOSE CONNECT");

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
})
.then(() => {
  console.log("🟢 MongoDB connected");
})
.catch(err => {
  console.error("❌ MongoDB error");
  console.error(err.message);
});

console.log("AFTER MONGOOSE CONNECT");

// ===== Mongoose Model =====
const ReminderSchema = new mongoose.Schema({
  userId: String,
  petName: String,
  action: String,
  notifyAt: Date,
  notified: {
    type: Boolean,
    default: false
  }
});

const Reminder = mongoose.model("Reminder", ReminderSchema);

// ===== API：新增提醒 =====
app.post("/add-reminder", async (req, res) => {
  const { userId, petName, message, remindAt } = req.body;

  if (!userId || !petName || !message || !remindAt) {
    return res.status(400).send("資料不完整");
  }

  await Reminder.create({
    userId,
    petName,
    action: message,
    notifyAt: new Date(remindAt),
  });

  console.log("📥 新提醒已存 DB:", petName, message, remindAt);
  res.send("ok");
});

// ===== 健康檢查（給 Render / UptimeRobot 用）=====
app.get("/health", (req, res) => {
  res.send("ok");
});

// ===== Cron：每分鐘檢查提醒 =====
const cron = require("node-cron");
const axios = require("axios");

cron.schedule("* * * * *", async () => {
  const now = new Date();

  const reminders = await Reminder.find({
    notifyAt: { $lte: now },
    notified: false
  });

  for (const r of reminders) {
    console.log("⏰ 觸發提醒:", r.petName, r.action);

    // 🔔 LINE Push
    await axios.post(
      "https://api.line.me/v2/bot/message/push",
      {
        to: r.userId,
        messages: [{
          type: "text",
          text: `🐾 ${r.petName} 要 ${r.action} 了！`
        }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.LINE_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    r.notified = true;
    await r.save();
  }
});

// ===== 啟動 Server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});