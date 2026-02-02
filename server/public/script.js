// ===== 設定區 =====
const REPO = "a855250a/pet-reminder";
const FILE = "reminders.json";

// ===== 取得畫面元素 =====
const petNameInput = document.getElementById("petName");
const messageInput = document.getElementById("message");
const remindAtInput = document.getElementById("remindAt");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("list");

// ===== 本地顯示用 =====
const reminders = [];

// ===== 新增提醒 =====
addBtn.addEventListener("click", async () => {
  const petName = petNameInput.value.trim();
  const message = messageInput.value.trim();
  const remindAt = remindAtInput.value;

  if (!petName || !message || !remindAt) {
    alert("請填寫所有欄位");
    return;
  }

  const reminder = { petName, message, remindAt };

  try {
    const api = `https://api.github.com/repos/${REPO}/contents/${FILE}`;

    // ① 取得現有檔案
    const res = await fetch(api, {
      headers: { Authorization: `token ${TOKEN}` }
    });

    if (!res.ok) throw new Error("讀取 GitHub 檔案失敗");

    const data = await res.json();
    const sha = data.sha;
    const content = JSON.parse(atob(data.content));

    // ② 加入提醒
    content.push(reminder);

    // ③ 更新回 GitHub
    const update = await fetch(api, {
      method: "PUT",
      headers: {
        Authorization: `token ${TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "add reminder from mobile",
        content: btoa(JSON.stringify(content, null, 2)),
        sha
      })
    });

    if (!update.ok) throw new Error("GitHub 更新失敗");

    reminders.push(reminder);
    renderList();

    alert("提醒已成功加入！1分鐘內會生效");

    petNameInput.value = "";
    messageInput.value = "";
    remindAtInput.value = "";

  } catch (err) {
    console.error(err);
    alert("新增失敗，檢查 Token 或網路");
  }
});

// ===== 顯示列表 =====
function renderList() {
  list.innerHTML = "";

  reminders.forEach(r => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div>🐾 ${r.petName}</div>
      <div>${r.message}</div>
      <div>⏰ ${new Date(r.remindAt).toLocaleString()}</div>
    `;
    list.appendChild(card);
  });
}