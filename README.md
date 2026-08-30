# 🌿 Mana: Empathetic AI Journal & Self-Reflection Companion

**Google Cloud Gen AI Academy APAC Edition - Ideathon 2026 Submission**
**Developed by:** Zahra 

## 📖 Elevator Pitch
**Mana** is a secure, intelligent personal journal that redefines how users interact with AI. Moving away from the conventional "fast-paced productivity" AI tools, Mana embraces **Positive Friction** and **Human-Computer Interaction (HCI)** principles to create a digital sanctuary. It encourages users to pause, breathe, and mindfully reflect on their emotions, utilizing AI as a supportive, empathetic listener rather than just a text generator.

## 🔗 Live Demo & Links
* **Interactive Prototype (Google Studio):** https://ai.studio/apps/b7a5d027-b635-4886-8a4e-faad7a7c613f

https://mana-ai.onrender.com/

* Codelab
* **GitHub Repository:**
* https://github.com/zahrakhorram2314-del/coffee-shop-ai-agent  Task 3
* https://github.com/zahrakhorram2314-del/bigquery-mcp-agent  Task 2
* https://github.com/zahrakhorram2314-del/gemini-rag-demo/tree/main  Task1


## 🛠️ Technical Architecture & Google Cloud Integration
Mana is built strictly adhering to the Ideathon architectural requirements, ensuring high performance, user privacy, and data security:

* **🧠 Gemini API (Intelligent Empathetic Engine):** Powers the core conversational interface and journal synthesis. Gemini analyzes daily entries to extract dominant moods, emotional themes, and provides gentle, constructive feedback without clinical overstepping.
* **🔐 Firebase Authentication (Identity Management):** Ensures secure, seamless user onboarding (Google Sign-in/Email) and creates unique UIDs for isolated data environments.
* **🗄️ Cloud Firestore (Real-time Database):** Securely stores journal entries, structured mood summaries, and AI conversation histories. Every piece of data is partitioned and accessible only by the authenticated user.
* **🛡️ Secret Manager (Security Protocol):** Safeguards all critical environmental variables, including the Gemini API keys and Firebase configuration details, preventing any exposure of sensitive credentials.

## ✨ Core Features & UX Philosophy
1. **Guided Emotional Reflection:** Instead of a blank intimidating screen, Mana greets users with breathing exercises (like the 4x4 Box Breathing) to ground them before they write.
2. **AI-Powered Synthesis:** Transforms raw, stream-of-consciousness journaling into structured emotional insights, highlighting resilience and positive growth patterns over 3, 7, or all-time day ranges.
3. **Privacy by Design:** Emphasizes a "Zero-Judgment, High-Security" environment. The UI communicates safety, utilizing calming color palettes (deep greens and soft whites) and clear visual indicators of data isolation.
4. **Mindful AI Persona:** The system prompt is engineered to make Gemini act as a warm, supportive peer. It strictly avoids diagnostic language, offering validation and encouragement tailored to the user's current emotional state.

## 🚀 How to Run Locally
1. Clone the repository: `git clone [Your Repo Link]`
2. Install dependencies: `npm install` (or `pip install -r requirements.txt` depending on your framework)
3. Set up your `.env` file with Firebase credentials and Gemini API Key (managed via Google Cloud Secret Manager).
4. Run the application: `npm run dev` (or `streamlit run app.py`)

---
*Built with mindfulness and empathy for a better digital wellbeing.*

