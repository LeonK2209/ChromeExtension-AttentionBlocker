// popup.js
// Steuert die UI im Popup: Blockliste, An/Aus-Schalter, Fokus-Timer-Anzeige.

const toggleActive = document.getElementById("toggleActive");
const statusText = document.getElementById("statusText");
const domainInput = document.getElementById("domainInput");
const addDomainBtn = document.getElementById("addDomainBtn");
const domainList = document.getElementById("domainList");
const timerDisplay = document.getElementById("timerDisplay");
const stopTimerBtn = document.getElementById("stopTimerBtn");

let countdownInterval = null;

// --- Initiales Laden ---
async function init() {
  const { blocklist = [], isActive = false, focusEndTime = null } =
    await chrome.storage.local.get(["blocklist", "isActive", "focusEndTime"]);

  toggleActive.checked = isActive;
  statusText.textContent = isActive ? "Aktiv" : "Inaktiv";

  renderDomainList(blocklist);

  if (focusEndTime && focusEndTime > Date.now()) {
    startCountdownDisplay(focusEndTime);
  } else {
    timerDisplay.textContent = "--:--";
  }
}

// --- Blockliste rendern ---
function renderDomainList(domains) {
  domainList.innerHTML = "";
  domains.forEach((domain) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${domain}</span><button data-domain="${domain}">✕</button>`;
    domainList.appendChild(li);
  });
}

// --- An/Aus-Schalter ---
toggleActive.addEventListener("change", async () => {
  const isActive = toggleActive.checked;
  await chrome.storage.local.set({ isActive });
  statusText.textContent = isActive ? "Aktiv" : "Inaktiv";
});

// --- Domain hinzufügen ---
addDomainBtn.addEventListener("click", addDomain);
domainInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addDomain();
});

async function addDomain() {
  const raw = domainInput.value.trim().toLowerCase();
  if (!raw) return;

  // Einfache Bereinigung: entfernt "https://", "www." und Pfade
  const cleaned = raw
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];

  const { blocklist = [] } = await chrome.storage.local.get(["blocklist"]);
  if (!blocklist.includes(cleaned)) {
    blocklist.push(cleaned);
    await chrome.storage.local.set({ blocklist });
    renderDomainList(blocklist);
  }
  domainInput.value = "";
}

// --- Domain entfernen ---
domainList.addEventListener("click", async (e) => {
  if (e.target.tagName === "BUTTON") {
    const domainToRemove = e.target.getAttribute("data-domain");
    const { blocklist = [] } = await chrome.storage.local.get(["blocklist"]);
    const updated = blocklist.filter((d) => d !== domainToRemove);
    await chrome.storage.local.set({ blocklist: updated });
    renderDomainList(updated);
  }
});

// --- Fokus-Timer starten ---
document.querySelectorAll(".startTimerBtn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const minutes = parseInt(btn.getAttribute("data-minutes"), 10);
    const response = await chrome.runtime.sendMessage({
      type: "START_FOCUS_TIMER",
      minutes
    });
    if (response && response.success) {
      toggleActive.checked = true;
      statusText.textContent = "Aktiv";
      startCountdownDisplay(response.endTime);
    }
  });
});

// --- Fokus-Timer stoppen ---
stopTimerBtn.addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "STOP_FOCUS_TIMER" });
  toggleActive.checked = false;
  statusText.textContent = "Inaktiv";
  timerDisplay.textContent = "--:--";
  if (countdownInterval) clearInterval(countdownInterval);
});

// --- Countdown-Anzeige im Popup ---
function startCountdownDisplay(endTime) {
  if (countdownInterval) clearInterval(countdownInterval);

  function tick() {
    const remainingMs = endTime - Date.now();
    if (remainingMs <= 0) {
      timerDisplay.textContent = "00:00";
      clearInterval(countdownInterval);
      return;
    }
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }

  tick();
  countdownInterval = setInterval(tick, 1000);
}

init();
