require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const FILE = "reminders.json";
const REPO = "a855250a/pet-reminder";
const FILE_PATH = "reminders.json";
const API_URL = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;
const TOKEN = process.env.GITHUB_TOKEN;

// 若本機檔案不存在就建立
if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, "[]");
}

// 🔄 同步到 GitHub
async function syncToGitHub(reminders) {
  try {
    // 1️⃣ 取得檔案 SHA
    const res = await axios.get(API_URL, {
      headers: { Authorization: `token ${TOKEN}` }
    });

    const sha = res.data.sha;

    // 2️⃣ 上傳新內容
    await axios.put(
      API_URL,
      {
        message: "update reminders from app",
        content: Buffer.from(JSON.stringify(reminders, null, 2)).toString("base64"),
        sha
      },
      {
        headers: { Authorization: `token ${TOKEN}` }
      }
    );

    console.log("☁️ GitHub 同步成功");
  } catch (err) {
    console.error("❌ GitHub 同步失敗:", err.response?.data || err.message);
  }
}

// ➕ 新增提醒
app.post("/add-reminder", async (req, res) => {
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

  // 存本機
  fs.writeFileSync(FILE, JSON.stringify(reminders, null, 2));
  console.log("📥 新提醒已存本機:", petName, message, remindAt);

  // 同步 GitHub
  await syncToGitHub(reminders);

  res.send("ok");
});

// 📤 提供查看（可選）
app.get("/reminders", (req, res) => {
  const reminders = JSON.parse(fs.readFileSync(FILE));
  res.json(reminders);
});

// 🚀 啟動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});