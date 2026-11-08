# Mana – Chrome Extension

A small popup companion for [Mana](../README.md), an AI journaling app. Write a thought, and Mana replies with a short, empathetic reflection and one gentle question. Powered by the Gemini API.

## Features

- Quick reflection popup, one click from the browser toolbar
- Warm, brief replies with one reflective question
- Replies in the same language you write in
- Your API key is stored only in your own browser (`chrome.storage.local`), never in this repo

## Install (developer mode)

1. Download this repository as a ZIP and extract it.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the `chrome-extension` folder (the one containing `manifest.json`).
5. Click the puzzle icon in the toolbar and open **Mana**.

## Usage

1. Get a free API key from [Google AI Studio](https://aistudio.google.com).
2. Click the Mana icon, write a thought, and press **Ask Mana**.
3. The first time, paste your API key when asked. It is saved locally.

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension configuration (Manifest V3) |
| `popup.html` | Popup layout |
| `popup.css` | Popup styling |
| `popup.js` | Calls the Gemini API and shows the reply |
| `icon.png` | Extension icon |

## Privacy

Text you write is sent to the Gemini API to generate a reply. Nothing is stored by this extension except your API key, locally in your browser.

## Note

Mana is a reflection tool, not a replacement for professional mental health support.
