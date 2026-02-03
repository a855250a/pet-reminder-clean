const petNameInput = document.getElementById("petName");
const messageInput = document.getElementById("message");
const remindAtInput = document.getElementById("remindAt");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("list");

// 🔹 只用來顯示畫面（不是排程用）
const reminders = [];

// 🔴 測試用：先寫死你的 LINE userId（之後可以改成自動）
const LINE_USER_ID = "U37a3cfd8d4488d31650360748ec75ae6"; // ← 換成你自己的

addBtn.addEventListener("click", async () => {
  const petName = petNameInput.value.trim();
  const message = messageInput.value.trim();
  const remindAt = remindAtInput.value;

  if (!petName || !message || !remindAt) {
    alert("請填寫所有欄位");
    return;
  }

  // 🔔 一定要包含 userId
  const reminder = {
    userId: LINE_USER_ID,
    petName,
    message,
    remindAt
  };

  try {
    const res = await fetch("/add-reminder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(reminder)
    });

    if (!res.ok) {
      const text = await res.text();
      alert("後端錯誤：" + text);
      return;
    }

    // ✅ 後端成功，才更新畫面
    reminders.push(reminder);
    renderList();

    alert("提醒已送出（時間到 LINE 會通知）");

    petNameInput.value = "";
    messageInput.value = "";
    remindAtInput.value = "";

  } catch (err) {
    console.error("送出提醒失敗", err);
    alert("網路或伺服器錯誤");
  }
});

function renderList() {
  list.innerHTML = "";

  reminders.forEach(r => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="pet">🐾 ${r.petName}</div>
      <div class="msg">${r.message}</div>
      <div class="time">📅 ${formatTime(r.remindAt)}</div>
    `;

    list.appendChild(card);
  });
}

function formatTime(time) {
  return new Date(time).toLocaleString();
}