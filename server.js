require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const FILE = "reminders.json";

// 若檔案不存在就建立
if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, "[]");
}

// ➕ 新增提醒（小工具用）
app.post("/add-reminder", (req, res) => {
  const { petName, message, remindAt } = req.body;

  if (!petName || !message || !remindAt) {
    return res.status(400).send("資料不完整");
  }

  const reminders = JSON.parse(fs.readFileSync(FILE));
  reminders.push({
    petName,
    message,
    remindAt,
    sent: false
  });

  fs.writeFileSync(FILE, JSON.stringify(reminders, null, 2));

  console.log("📥 新提醒已存:", petName, message, remindAt);
  res.send("ok");
});

// 📤 給 GitHub Actions 讀
app.get("/reminders", (req, res) => {
  const reminders = JSON.parse(fs.readFileSync(FILE));
  res.json(reminders);
});

// 🚀 啟動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});