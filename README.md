# Mana — AI Journaling & Self-Reflection Companion

Mana is an experimental AI-assisted journaling project exploring how conversational AI can support personal reflection through a calm, user-directed experience.

It is a software prototype, not a clinical or mental-health service. It does not provide diagnosis, treatment, or professional advice.

## Project links

- **Live prototype:** [Open Mana in Google AI Studio](https://mana-journal-app-2026.ai.studio/)
- **Source code:** [GitHub repository](https://github.com/zahrakhorram2314-del/mana_ai)
- **Project walkthrough:** [Video on LinkedIn](https://lnkd.in/p/eZENQcwu)
- **Case study:** [Mana — Where Psychology Meets AI](https://zahrakhorram2314.medium.com/mana-where-psychology-meets-ai-for-better-self-reflection-51b767ed5996)

## What the prototype includes

- Journal entry creation and organization.
- AI-assisted reflection and single-entry summaries.
- Daily summaries with mood labels, themes, and reflection prompts.
- A conversational interface that can optionally use recent journal context.
- Optional Gemini web search for requests that need external information.
- Email/password, Google, and anonymous Firebase sign-in flows.
- Firestore-backed user profiles, journal entries, chat messages, and daily summaries.
- A non-clinical disclaimer and supportive crisis-response instructions in the model's system instruction.

The AI-generated mood labels and scores are interpretive outputs, not validated psychological measurements.

## Technology

- **Frontend:** React, TypeScript, Vite
- **AI:** Google Gemini API via `@google/genai`
- **Backend:** Express
- **Authentication:** Firebase Authentication
- **Database:** Cloud Firestore
- **Deployment target:** Docker / Google Cloud Run

## Architecture overview

1. The React client sends chat and journal-analysis requests to the Express API.
2. The server calls the Gemini API and returns generated text or structured JSON.
3. Firebase Authentication provides user identities.
4. The client-side Firestore service stores user-scoped data under `users/{uid}`.
5. Firestore Security Rules restrict access to the authenticated owner of each user document.

The Gemini API key can be supplied by the server environment or by a user-provided key. A user-provided key is sent to the application's API endpoint for the request; users should only use a deployment they trust.

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

## Privacy and safety notes

- Firestore rules are designed to restrict each signed-in user to their own user-scoped documents.
- The app's Firestore rules do not, by themselves, establish end-to-end encryption or guarantee that data is never exposed.
- Journal text may be sent to Gemini when a user requests AI features. Review the applicable Google AI and Firebase data-handling terms before using real or sensitive personal information.
- The application is not a substitute for mental-health care, diagnosis, or emergency support.
- AI-generated summaries, mood labels, and reflections can be inaccurate. Users should review them critically and remain in control of their own interpretation.

## Known limitations

- The repository does not currently include an automated test suite for the AI safety boundaries or Firestore rules.
- AI output is probabilistic; the project does not claim zero hallucinations or guaranteed clinical safety.
- Deployment configuration and live-demo availability may differ by environment and should be verified before relying on the hosted prototype.

## Roadmap

- Add automated tests for API validation and Firestore access rules.
- Add documented evaluation cases for prompt injection, crisis language, and non-clinical boundaries.
- Document data retention, deletion, and user consent flows.
- Add reproducible deployment instructions and a verified demo walkthrough.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).
