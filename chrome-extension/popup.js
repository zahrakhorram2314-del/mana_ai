const noteInput = document.getElementById("note");
const reflectBtn = document.getElementById("reflectBtn");
const resultSection = document.getElementById("result");
const responseText = document.getElementById("response");

const SYSTEM_PROMPT =
"You are Mana, a calm and warm journaling companion. " +
"Reply in the same language the user writes in. " +
"First, reflect back what the user said in your own words, and gently name the feeling you notice, using tentative language like 'it sounds like'. " +
"Do not give advice or solutions unless asked. Avoid clichés and generic comfort. " +
"End with exactly one open, specific reflective question that builds on their words. " +
"Keep it to 3 to 4 short sentences. Do not diagnose. " +

"If the user mentions harming themselves, respond with care and encourage them to reach out to someone they trust or a local emergency service.";
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
"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
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
