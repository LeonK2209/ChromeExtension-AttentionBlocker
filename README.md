# Ablenkblocker – Chrome Extension

Persönliches Projekt: Eine Chrome-Extension, die ablenkende Webseiten (z.B. YouTube, Instagram) blockiert – mit Fokus-Timer im Pomodoro-Stil. Gedacht als Nebenprojekt / Portfolio-Stück.

## Status
🚧 In Entwicklung – MVP-Phase

## Stack
- **Sprache:** JavaScript (Vanilla, kein Framework)
- **IDE:** VS Code
- **Extension-Standard:** Manifest V3
- **Speicherung:** `chrome.storage.local`
- **Blockier-Logik:** `declarativeNetRequest` API

## Projektstruktur
```
ablenkblocker/
├── manifest.json     # Metadaten & Permissions
├── background.js     # Service Worker, Timer-Logik im Hintergrund
├── popup.html         # UI beim Klick auf das Extension-Icon
├── popup.js
├── popup.css
├── blocked.html       # Wird angezeigt, wenn eine Seite blockiert ist
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## MVP – Kernfunktionen
- [ ] Blockliste verwalten (Domains hinzufügen/entfernen)
- [ ] An/Aus-Schalter für den Blocker
- [ ] Umleitung auf `blocked.html` bei blockierten Seiten
- [ ] Fokus-Timer (Pomodoro-Prinzip, z.B. 25 Min)

## Später / Nice-to-have (nicht im MVP)
- Nutzungsstatistiken
- Zeitpläne (z.B. nur werktags aktiv)
- Sync über mehrere Geräte
- Premium-Features / Monetarisierung

## Lokal testen
1. Repo klonen
2. Chrome öffnen → `chrome://extensions`
3. "Entwicklermodus" oben rechts aktivieren
4. "Entpackte Erweiterung laden" → Projektordner auswählen
5. Extension sollte in der Toolbar erscheinen

## Roadmap
| Phase | Status |
|---|---|
| Setup & Grundgerüst | ⬜ |
| Blockliste & Speicherung | ⬜ |
| Blockier-Logik | ⬜ |
| Timer/Fokus-Modus | ⬜ |
| Design/Politur | ⬜ |
| Testing | ⬜ |
| Chrome Web Store Release | ⬜ |

## Notizen
- Konkurrenz: StayFocusd, BlockSite, Cold Turkey – eigener Winkel nötig (z.B. Zielgruppe Studenten, eingebauter Pomodoro-Timer statt Zusatzfeature)
- Chrome Web Store Dev-Account: einmalig 5 $ Gebühr
