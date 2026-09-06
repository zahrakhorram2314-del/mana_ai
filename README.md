# 🌿 Mana: Empathetic AI Journal & Self-Reflection Companion

**Google Cloud Run AI Hackathon Submission**  
**Developed by:** Zahra

---

## 📣 Elevator Pitch

**Mana** is a serene, intelligent personal journal that redefined how users interact with AI. Moving away from conventional "fast-paced productivity" AI tools, Mana introduces **Positive Friction in Human-Computer Interaction (HCI)** to create a digital sanctuary. It encourages users to pause, breathe, and mindfully reflect on their emotions, utilizing Gemini as a supportive, empathetic listener rather than just a text generator.

---

## 🔗 Live Demo & Links

* **Interactive Prototype:** [Mana AI Studio App](https://journal-app.ai.studio)
* **GitHub Repository:** [Mana Repository](https://github.com)

---

## 🛠️ Technical Architecture & Google Cloud Integration

Mana is built strictly adhering to cloud-native architectural standards, ensuring high performance, zero-hallucination guardrails, and data security:

* **🧠 Gemini API (Empathetic Engine):** Powers the core conversational interface and journal synthesis. Gemini analyzes daily entries to extract key themes, emotional trends, and provides gentle, constructive feedback without clinical overstepping.
* **🔓 Friction-Free Judge Access (Demo Architecture):** For this hackathon evaluation, Firebase Authentication was intentionally omitted to provide judges with immediate, zero-friction access to all application features without requiring account creation.
* **📊 Google Cloud Firestore (Real-Time Database):** Securely stores journal entries, structured emotional reflections, and conversation history in real time.
* **🔐 Google Cloud Secret Manager:** Safeguards critical environmental variables, including the Gemini API keys and Firebase configurations, preventing any credential exposure.
* **🚀 Google Cloud Run:** Containerized deployment for scalable, low-latency microservices.

---

## 🌟 Core Features & UX Philosophy

1. **Guided Emotional Reflection:** Instead of a blank screen, Mana greets users with breathing exercises (like the 4-4-4 Box Breathing) to ground them before writing.
2. **AI-Powered Synthesis:** Transforms raw journal entries into structured emotional insights, highlighting resilience and positive growth patterns over 3, 7, or 30-day ranges.
3. **Privacy & Safety by Design:** Operates on a supportive companion model with explicit guardrails, ensuring Mana serves as a journaling assistant and not a medical therapist.
4. **Mindful AI Persona:** System instructions are fine-tuned so Gemini offers warm, non-judgmental validation tailored to the user's current state.

---

## 💻 How to Run Locally

1. Clone the repository:
   ```bash
   git clone <repository-url>
npm install
npm run dev
