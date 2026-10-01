## <img src="./leaves.gif" width="28" /> Mana: Empathetic AI Journal & Self-Reflection Companion  

**Google Cloud Run AI Hackathon Submission**  
**Developed by:** Zahra Khorram 

![License](https://img.shields.io/badge/License-MIT-green.svg)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![Google Cloud](https://img.shields.io/badge/Google%20Cloud-GCP-4285F4?logo=googlecloud)
![Gemini API](https://img.shields.io/badge/AI-Gemini%20API-8E44AD)


---

## 📣 Elevator Pitch

Mana is a calm, AI-powered personal journal designed to make digital reflection feel more mindful and human. Instead of focusing on fast-paced productivity, Mana introduces the idea of Positive Friction in Human-Computer Interaction (HCI) by encouraging users to pause, breathe, and reflect before writing.


Powered by Gemini, Mana acts as a supportive reflection companion rather than simply generating text, helping users explore their thoughts and emotions through a more thoughtful interaction.
---

## 🔗 Live Demo & Links

* **Interactive Prototype:** [ https://mana-journal-app-2026.ai.studio/ )
  -
* **GitHub Repository:** [Mana Repository](https://github.com)
  _
**Video Demo (LinkedIn):** [Watch Demo Video on LinkedIn](https://lnkd.in/p/eZENQcwu)
  _
* 📝 **Medium Article:** [Read the Case Study](https://zahrakhorram2314.medium.com/mana-where-psychology-meets-ai-for-better-self-reflection-51b767ed5996)
---

## <img src="./camera-flash.gif" width="28" /> Application Preview & Core Features

| 📝 New Journal Entry | 📊 Emotional Summary Dashboard |
| :---: | :---: |
| ![Journal Entry](Screenshot_۲۰۲۶۰۹۰۸_۲۱۳۱۲۶_Chrome.jpg) | ![Summary Dashboard](Screenshot_۲۰۲۶۰۹۰۸_۲۱۳۱۳۶_Chrome.jpg) |

| 🧘 Peace & Wellness Sanctuary | 💬 Mana Reflection Space |
| :---: | :---: |
| ![Wellness Sanctuary](Screenshot_۲۰۲۶۰۹۰۸_۲۱۳۱۴۴_Chrome.jpg) | ![Mana Reflection](Screenshot_۲۰۲۶۰۹۰۸_۲۱۳۲۱۲_Chrome.jpg) |

---

## 🛠️ Technical Architecture & Google Cloud Integration

Mana is built strictly adhering to cloud-native architectural standards, ensuring high performance, zero-hallucination guardrails, and data security:

* **🧠 Gemini API (Empathetic Engine):** Powers the core conversational interface and journal synthesis. Gemini analyzes daily entries to extract key themes, emotional trends, and provides gentle, constructive feedback without clinical overstepping.
* **🔓 Friction-Free Judge Access (Demo Architecture):** For this hackathon evaluation, Firebase Authentication was intentionally omitted to provide judges with immediate, zero-friction access to all application features without requiring account creation.
* **📊 Google Cloud Firestore (Real-Time Database):** Securely stores journal entries, structured emotional reflections, and conversation history in real time.
* **🔐 Google Cloud Secret Manager:** Safeguards critical environmental variables, including the Gemini API keys and Firebase configurations, preventing any credential exposure.
* **🚀 Google Cloud Run:** Containerized deployment for scalable, low-latency microservices.

---

### 🧠 Sub-Contextual & Cognitive Memory Architecture

Grounded in Cognitive Psychology and modern agentic engineering standards, **Mana** employs a sub-contextual approach to balance AI intelligence with human cognitive ergonomics:

* **Bounded Context Lens (L1 Working Memory):** Instead of dumping massive raw chat history into the prompt window, Mana models context as a high-speed *L1 Cache*. Text streams are strictly bounded and structured to eliminate attention degradation, lower response latency, and maintain deterministic empathetic depth.
* **Positive Friction & Cognitive Ergonomics:** Rather than encouraging passive content consumption, Mana introduces intentional HCI friction (such as guided box-breathing prompts) to reduce mental friction and encourage deliberate self-reflection.
* **Deterministic Guardrail Harness:** Non-deterministic LLM generation is strictly bounded by deterministic validation layers, ensuring zero-hallucination boundaries and preventing the system from crossing non-clinical limits.

---

## <img src="./glowing-star.gif" width="28" /> Core Features & UX Philosophy

###  System Instruction Architecture (v3)
The prompt engineering behind **Mana** is rooted in Cognitive Ergonomics and Human-Computer Interaction (HCI) principles. It balances emotional safety with active self-reflection:

1. **Strict Non-Clinical Guardrails:** Enforces a hard boundary against acting as a medical/clinical tool while providing compassionate distress-handling protocols.
2. **Cognitive Load Protection:** Implements a strict *One-Question Constraint* and *Volume Mirroring* to prevent decision fatigue and tech anxiety.
3. **ACT-Informed Defusion:** Applies Acceptance and Commitment Therapy (ACT) concepts to help users separate rigid thoughts from objective reality.
4. **Gentle Reframing & Strengths Mirroring:** Validates emotions first, followed by subtle perspective shifts and reinforcement of user agency.
5. **Inner Weather Synthesis:** Formats long-term journaling summaries into intuitive, low-friction "Inner Weather Reports."

---

## 🛡️ Responsible AI & Ethical Guardrails

Mana AI is built in explicit alignment with **Google’s Responsible AI Principles**, ensuring that generative capabilities serve human well-being safely and transparently.

* **Non-Clinical Boundary (Safety & Social Benefit):** Designed strictly for supportive self-reflection and daily journaling. Systematic system instructions explicitly prevent the model from providing psychiatric diagnoses, clinical advice, or acting as a licensed therapist.
* **Privacy by Design:** User interaction data and reflection logs are isolated and secured using **Google Cloud Firestore Security Rules** and **GCP Secret Manager**, ensuring sensitive personal notes are never exposed or misused.
* **Cognitive Load & Ergonomics:** Grounded in cognitive psychology, the prompt architecture avoids overwhelming text generation, using structured, calm, and empathetic framing to minimize user mental friction.
* **Human-in-the-Loop & Agency:** The AI acts strictly as a reflective co-pilot, leaving all emotional evaluation and decision-making fully in the hands of the user.
___

## 🗺️ Future Roadmap
* 🎨 **Figma Interactive Prototypes:** Complete high-fidelity UI design flows and micro-interactions.
* 📊 **Mood Trend Insights:** Introduce non-intrusive, privacy-first emotional reflection patterns over time.
* 🌍 **Localization:** Expand prompt architecture for multi-language cognitive UX support.

___


### 💻 How to Run Locally

**1. Clone the repository:**

```bash
git clone https://github.com/zahrakhorram2314-del/mana_ai/edit/main/README.md
cd mana_ai

npm install
npm run dev

___

## 📜 License
Distributed under the MIT License.

