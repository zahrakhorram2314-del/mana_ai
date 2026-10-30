# Mana — AI Journaling & Personal Reflection Companion

Mana is an experimental AI-assisted journaling project exploring how conversational AI can support personal reflection and everyday personal growth through a calm, user-directed experience.

The project brings together ideas from psychology, cognitive UX, and human–AI interaction. It is a software prototype—not a clinical or mental-health service—and does not provide diagnosis, treatment, or professional advice.

## Project links

- **Live prototype:** [Open Mana in Google AI Studio](https://mana-journal-app-2026.ai.studio/)
- **Source code:** [GitHub repository](https://github.com/zahrakhorram2314-del/mana_ai)
- **Project walkthrough:** [Video on LinkedIn](https://lnkd.in/p/eZENQcwu)
- **Case study:** [Mana — Where Psychology Meets AI](https://zahrakhorram2314.medium.com/mana-where-psychology-meets-ai-for-better-self-reflection-51b767ed5996)

## What Mana explores

Mana is organized around a connected reflection workflow:

1. **Journal:** Write, organize, search, and revisit personal entries.
2. **Reflect:** Request AI-assisted observations and gentle reframing grounded in the text the user shared.
3. **Explore:** Optionally examine a relevant idea inspired by a nonfiction book.
4. **Act:** When appropriate, consider a small, optional action that can be tried in everyday life.
5. **Review:** Revisit journal themes and summaries over time.

The user remains in control: suggestions can be declined, and a quiet or positive entry does not need to be turned into a problem to solve.

## Current prototype features

- **AI journaling:** Create, edit, delete, search, and organize journal entries, with mood labels, a user-adjustable mood score, and tags.
- **Personalized Life Insights:** An optional reflection generated from the user's journal text, with explicitly stated observations, a tentative perspective, and a small optional next step.
- **Opt-in book ideas:** When a relevant connection is identified, users can choose whether to explore a paraphrased idea associated with a nonfiction book.
- **Proactive Life Guidance:** A separate, optional feature that may offer an occasional practical idea and small experiment related to habits, focus, priorities, decision-making, or personal goals.
- **Accept / decline controls:** Users can try or dismiss a guidance suggestion; the app records these choices to help avoid repeatedly presenting a declined suggestion.
- **Weekly insights:** A synthesis of themes and reflective takeaways from journal entries.
- **Mana Chat:** A conversational interface that can optionally use recent journal context.
- **Mood summaries and trends:** AI-generated mood labels, themes, and summaries across selected time periods.
- **Mindful breathing:** Short guided breathing exercises with visual pacing and optional audio cues.
- **Prompt suggestions:** Optional writing prompts to help users begin or continue a reflection.
- **Authentication and persistence:** Firebase sign-in options and storage for journal-related data.

These are prototype capabilities. Their availability can depend on the configured Firebase project, Gemini API access, deployment environment, and whether the live AI service or an offline fallback is being used.

## Book and source integrity

Mana may draw on paraphrased concepts associated with works such as:

- *Atomic Habits* — James Clear
- *Essentialism* — Greg McKeown
- *Deep Work* — Cal Newport
- *Mindset* — Carol S. Dweck
- *Thinking in Bets* — Annie Duke
- *Grit* — Angela Duckworth
- *Four Thousand Weeks* — Oliver Burkeman
- *Man's Search for Meaning* — Viktor E. Frankl

The project uses book-related concepts in its own words. It does not claim to contain the full texts of these books, and paraphrases should not be mistaken for verified quotations, page references, or excerpts. Book metadata and model-generated interpretations should be evaluated separately.

## Human-centered and non-clinical boundaries

Mana is designed as a personal reflection companion, not as a therapist or clinical decision-support tool.

- It must not diagnose mental-health conditions or present journal-based interpretations as clinical assessments.
- Mood labels and scores are AI-generated interpretations or user-entered reflections, not validated psychological measurements.
- Suggestions are optional; the user can decline them without pressure.
- The system should distinguish details explicitly present in a journal entry from uncertain interpretations.
- It should not invent memories, motives, emotions, or personal history.
- It should not encourage emotional dependency or present itself as a replacement for trusted people or qualified professionals.
- When a situation calls for professional or urgent support, the app should encourage appropriate human help.

## Technology

- **Frontend:** React, TypeScript, Vite
- **AI integration:** Google Gemini API via `@google/genai`
- **Backend:** Express
- **Authentication:** Firebase Authentication
- **Database:** Cloud Firestore
- **Local persistence:** Browser storage for supported user-scoped data and offline continuity
- **Deployment target:** Docker / Google Cloud Run

## Architecture overview

1. The React client sends chat, journal-analysis, and reflection requests to the Express API.
2. The server uses the Gemini API when valid credentials and service access are available.
3. Where supported, local fallback logic can return a limited structured response if remote AI access is unavailable. The fallback should be distinguishable from a live Gemini response.
4. Firebase Authentication provides user identities.
5. The Firestore service stores journal-related records in user-scoped paths such as `users/{uid}`.
6. Firestore Security Rules are intended to restrict access to the authenticated owner of each user document.

The Gemini API key can be supplied by the server environment or, where enabled, by a user-provided key. A user-provided key is sent to the application's API endpoint for the request; users should only use a deployment they trust. Never commit private service-account credentials or secret API keys.

## Run locally

Requirements: Node.js 20 or later and a Firebase project configured for the application.

```bash
git clone https://github.com/zahrakhorram2314-del/mana_ai.git
cd mana_ai
npm install
npm run dev
```

Create a `.env` file if you want to provide a server-side Gemini key:

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=8080
```

Configure the Firebase web app using the project's Firebase configuration file. Do not commit private service-account credentials or secret keys.

For a production build:

```bash
npm run build
npm start
```

For a Docker build:

```bash
docker build -t mana .
docker run --rm -p 8080:8080 -e GEMINI_API_KEY=your_gemini_api_key mana
```

## Privacy and data handling

- Firestore rules are intended to restrict signed-in users to their own user-scoped documents. Review the deployed rules and authentication flows before using the application with real personal data.
- Local browser storage and Firestore synchronization are separate persistence mechanisms; behavior can differ when offline or when a Firebase connection is unavailable.
- Journal text may be sent to Gemini when a user requests AI features. Review the applicable Google AI and Firebase data-handling terms before entering sensitive personal information.
- Firestore rules do not, by themselves, establish end-to-end encryption or guarantee that data is never exposed.
- Do not assume that guest data is private across separate browser sessions unless each guest has a unique authenticated Firebase identity and the deployed security rules enforce that identity.
- Users should be able to review AI-generated summaries and reflections critically and remain in control of their own interpretation.

## Known limitations

- AI output is probabilistic and can be inaccurate; the project does not claim zero hallucinations or guaranteed clinical safety.
- Book-inspired content is paraphrased, not a verified quotation or a substitute for consulting the original book.
- The application has undergone development-time build and endpoint checks, but these do not replace independent security testing, Firestore Rules Emulator tests, or usability testing with participants.
- Authentication popups can behave differently in embedded or sandboxed browser environments.
- The production JavaScript bundle may benefit from code splitting to improve initial loading on slower mobile connections.
- Deployment configuration and live-demo availability may differ by environment and should be verified before relying on the hosted prototype.

## Roadmap

- Add automated Firestore Rules tests, including isolation tests for two independent guest accounts.
- Add documented evaluation cases for prompt injection, crisis language, grounding, and non-clinical boundaries.
- Document data retention, deletion, consent, and guest-to-account behavior.
- Improve initial-load performance through code splitting.
- Publish a reproducible demo walkthrough and a concise technical case study.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).
