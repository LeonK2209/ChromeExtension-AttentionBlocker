// background.js
// Läuft im Hintergrund als Service Worker.
// Aufgabe 1: Blockregeln (declarativeNetRequest) anhand der gespeicherten Blockliste setzen/entfernen.
// Aufgabe 2: Fokus-Timer verwalten (Start/Ende), auch wenn das Popup geschlossen ist.

const RULE_ID_START = 1000; // Start-ID für unsere dynamischen Regeln

// Baut aus der Blockliste (Array von Domains) die declarativeNetRequest-Regeln
function buildRules(domains) {
  return domains.map((domain, index) => ({
    id: RULE_ID_START + index,
    priority: 1,
    action: {
      type: "redirect",
      redirect: { extensionPath: "/blocked.html" }
    },
    condition: {
      urlFilter: `||${domain}`,
      resourceTypes: ["main_frame"]
    }
  }));
}

// Setzt die Regeln neu, basierend auf Blockliste + ob der Blocker aktiv ist
async function updateRules() {
  const { blocklist = [], isActive = false } = await chrome.storage.local.get([
    "blocklist",
    "isActive"
  ]);

  // Erst alle alten dynamischen Regeln entfernen
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingIds = existingRules.map((r) => r.id);

  const newRules = isActive ? buildRules(blocklist) : [];

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingIds,
    addRules: newRules
  });
}

// Reagiert auf Änderungen an Blockliste oder Aktiv-Status (z.B. vom Popup aus)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes.blocklist || changes.isActive)) {
    updateRules();
  }
});

// Beim Start der Extension (Browser-Start / Installation) Regeln einmal setzen
chrome.runtime.onInstalled.addListener(() => {
  updateRules();
});
chrome.runtime.onStartup.addListener(() => {
  updateRules();
});

// --- Fokus-Timer-Logik ---
// Nutzt chrome.alarms, damit der Timer auch weiterläuft, wenn das Popup geschlossen ist.

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "focusTimerEnd") {
    // Timer abgelaufen -> Blocker deaktivieren
    await chrome.storage.local.set({ isActive: false, focusEndTime: null });
  }
});

// Wird vom Popup aufgerufen, um einen Fokus-Timer zu starten
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_FOCUS_TIMER") {
    const minutes = message.minutes || 25;
    const endTime = Date.now() + minutes * 60 * 1000;

    chrome.storage.local.set({ isActive: true, focusEndTime: endTime }, () => {
      chrome.alarms.create("focusTimerEnd", { delayInMinutes: minutes });
      sendResponse({ success: true, endTime });
    });
    return true; // Async response
  }

  if (message.type === "STOP_FOCUS_TIMER") {
    chrome.alarms.clear("focusTimerEnd");
    chrome.storage.local.set({ isActive: false, focusEndTime: null }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
