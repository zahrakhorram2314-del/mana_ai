const keyInput = document.getElementById("apiKey");
const saveKeyBtn = document.getElementById("saveKey");
const textInput = document.getElementById("userText");
const sendBtn = document.getElementById("send");
const output = document.getElementById("output");

chrome.storage.local.get("geminiKey", (data) => {
  if (data.geminiKey) keyInput.value = data.geminiKey;
});

saveKeyBtn.addEventListener("click", () => {
  chrome.storage.local.set({ geminiKey: keyInput.value.trim() }, () => {
    output.textContent = "Key saved.";
  });
});

sendBtn.addEventListener("click", async () => {
  const text = textInput.value.trim();
  const key = keyInput.value.trim();
  if (!key) { output.textContent = "Please enter your Gemini API key first."; return; }
  if (!text) { output.textContent = "Write something first."; return; }

  output.textContent = "Thinking...";
  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + key,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: "You are Mana, a warm and gentle journaling companion. Reply briefly with empathy and one reflective question. Reply in the same language as the user." }]
          },
          contents: [{ parts: [{ text: text }] }]
        })
      }
    );
    const data = await res.json();
    output.textContent =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      data.error?.message ||
      "No response.";
  } catch (e) {
    output.textContent = "Error: " + e.message;
  }
});
