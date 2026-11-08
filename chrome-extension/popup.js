const noteInput = document.getElementById("note");
const reflectBtn = document.getElementById("reflectBtn");
const resultSection = document.getElementById("result");
const responseText = document.getElementById("response");

const SYSTEM_PROMPT =
  "You are Mana, a warm and gentle journaling companion. " +
  "Reply briefly with empathy and one reflective question. " +
  "Reply in the same language as the user.";

async function getKey() {
  const data = await chrome.storage.local.get("geminiKey");
  if (data.geminiKey) return data.geminiKey;
  const key = prompt("Paste your Gemini API key (saved only in this browser):");
  if (key && key.trim()) {
    await chrome.storage.local.set({ geminiKey: key.trim() });
    return key.trim();
  }
  return null;
}

reflectBtn.addEventListener("click", async () => {
  const text = noteInput.value.trim();
  if (!text) return;

  const key = await getKey();
  if (!key) return;

  reflectBtn.disabled = true;
  reflectBtn.textContent = "Thinking...";
  resultSection.hidden = false;
  responseText.textContent = "";

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: text }] }]
        })
      }
    );
    const data = await res.json();
    if (data.error) {
      responseText.textContent = "Error: " + data.error.message;
      if (res.status === 400 || res.status === 403) {
        await chrome.storage.local.remove("geminiKey");
      }
    } else {
      responseText.textContent =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    }
  } catch (e) {
    responseText.textContent = "Error: " + e.message;
  }

  reflectBtn.disabled = false;
  reflectBtn.textContent = "Ask Mana";
});
