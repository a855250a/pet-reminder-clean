import fetch from "node-fetch";

const USER_ID = process.env.USER_ID;
const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

// 你要送的內容（先固定，確認能跳）
const message = "🐾 寵物提醒：時間到了！";

async function sendLine() {
  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`
    },
    body: JSON.stringify({
      to: USER_ID,
      messages: [{ type: "text", text: message }]
    })
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(t);
  }

  console.log("LINE 推播成功");
}

sendLine();
