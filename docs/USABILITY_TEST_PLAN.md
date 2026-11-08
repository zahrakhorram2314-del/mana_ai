# Mana — Formative Usability Test Plan

**Document type:** Research protocol / test plan  
**Project:** Mana — AI Journaling & Self-Reflection Companion  
**Study type:** Small, formative usability evaluation (non-clinical)  
**Status:** Proposed — not yet conducted  
**Version date:** 2026-11-09

> **Important:** This document describes a proposed study. No participants have been recruited, no sessions have been conducted, and no findings or scores are claimed. This is a product-usability activity, not clinical or psychological research intended to assess mental health.

## 1. Purpose

Evaluate whether people can use Mana's core journaling and AI-reflection flows, understand which content is AI-generated, and remain in control of whether to accept or reject suggestions.

The study is intended to discover usability problems and improve the prototype. It is not designed to prove therapeutic benefit, reduce anxiety, measure a psychological trait, or establish population-wide conclusions.

## 2. Research questions

1. Can a first-time user create and save a journal entry without assistance?
2. Can users find a previously saved entry using the available search or tagging flow?
3. Can users distinguish their own text, an AI-generated observation, and a tentative AI interpretation?
4. Can users request a reflection and then edit, ignore, or decline its suggestions?
5. Do users understand when journal content may be sent to an external AI service?
6. What wording, navigation, accessibility, or trust issues interrupt task completion?

## 3. Participants and recruitment

**Initial target:** 5–8 adult volunteers for a formative round.

This is a practical discovery sample, not a statistically representative sample. A small sample can reveal recurring interaction problems but cannot establish prevalence or generalize to all users.

Recruit adults who are comfortable evaluating a journaling interface. Do not recruit on the basis of a mental-health diagnosis or ask people to disclose one. Participation must be voluntary; avoid recruiting anyone who may feel pressured by the researcher.

If the study is conducted as formal academic research, obtain the relevant university or ethics approval before recruitment and follow applicable institutional requirements.

## 4. Privacy, consent, and participant protection

- Explain the purpose, session activities, approximate duration, and what will be recorded before starting.
- Obtain informed, voluntary consent. Participants may skip any task or stop at any time without penalty.
- Use a test account and fictional scenario data. Do not ask participants to enter real journal entries, passwords, health details, or other sensitive personal information.
- Do not record screens, audio, video, names, email addresses, or other identifying information unless separately justified, explicitly consented to, and approved where required.
- Prefer anonymized participant codes such as P01 and P02.
- Record only task outcomes, usability observations, and optional non-sensitive comments.
- Store notes securely, restrict access, and define a deletion date before collecting data.
- Tell participants that AI features may transmit the text entered into those features to the configured external AI provider. Do not use real personal content in the study.
- Do not present Mana as therapy, diagnosis, crisis support, or a validated psychological instrument.
- If a participant becomes uncomfortable, pause or stop the session. Do not probe for personal explanations.

**Consent checklist**
- [ ] Purpose and non-clinical scope explained
- [ ] Tasks and approximate duration explained
- [ ] Voluntary participation and right to stop explained
- [ ] Data collected and not collected explained
- [ ] AI-provider data flow explained
- [ ] Storage, access, and deletion plan explained
- [ ] Participant questions answered and consent recorded appropriately

## 5. Test setup

Before each session:

1. Use a dedicated test account or a clean demo environment.
2. Confirm the prototype loads on the device being tested.
3. Confirm whether AI features are live or using a fallback. Record the actual state; never label fallback output as a live Gemini response.
4. Prepare fictional test content only.
5. Ensure no previous participant's entries or account data are visible.
6. Prepare a note sheet using participant codes, not names.
7. If a feature is unavailable, record it as unavailable rather than improvising a result.

**Suggested session length:** 20–30 minutes, including consent, tasks, and a short debrief. This is a planning estimate, not a measured result.

## 6. Fictional scenario

Give the participant this fictional prompt:

> Imagine you are using a journal to keep track of a busy study week. You want to save a short note, find it later, and see whether an optional AI reflection is useful. Please use only the fictional details in this scenario; do not enter anything personal.

Suggested fictional entry:

> "On Tuesday I planned to study for an hour, but I kept switching between tasks. I finished one reading section after making a short list. Tomorrow I want to try starting with one topic."

This text is intentionally ordinary and non-sensitive. The participant should not be asked whether it resembles their own life.

## 7. Task script

Ask participants to think aloud if they are comfortable. Do not teach the interface during the task unless they are blocked; note any assistance given.

| Task | Participant instruction | What to observe |
|---|---|---|
| T1 — Create an entry | Create and save a journal entry using the fictional scenario. | Can they find the writing area, save, and confirm success? |
| T2 — Retrieve an entry | Find the entry they just created. Use search or tags if available. | Navigation path, retrieval success, errors, and time. |
| T3 — Request reflection | Ask Mana for an optional reflection on the fictional entry. | Can they find the feature and understand the generated response? |
| T4 — Interpret the response | Point out which sentence repeats user-provided information and which sentence is an AI interpretation. | Can they distinguish source content from inference and uncertainty? |
| T5 — Exercise control | Edit, ignore, or decline a suggestion. | Is the control discoverable? Does the interface respect the choice? |
| T6 — Understand data flow | Explain, in their own words, what may happen to text submitted to an AI feature. | Do they understand the disclosure and external-provider boundary? |

If a task cannot be completed because a feature is not implemented, broken, or unavailable, record **Blocked / Not testable**. Do not count it as a participant failure.

## 8. Moderator guidance

- Use the same task wording for each participant.
- Avoid leading questions such as "Wasn't that easy?" or "Did you like the AI?"
- If a participant asks where to click, first say: "What would you expect to do next?"
- If assistance becomes necessary, provide the minimum help and record it.
- Do not interpret facial expressions or pauses as psychological states.
- Do not ask participants to disclose personal experiences.
- Separate observed behavior from the moderator's interpretation.
- End by reminding participants not to share personal journal content in the prototype.

## 9. Measures and recording template

Collect only what is needed to answer the research questions.

| Measure | Recording method |
|---|---|
| Task completion | Completed independently / completed with help / not completed / blocked |
| Errors or friction | Short factual description |
| Time-on-task | Optional approximate duration per task |
| Assistance | None / small hint / direct help |
| Comprehension | Correct / partly correct / incorrect / not assessed |
| Perceived control | Optional 1–5 rating with a plain-language prompt |
| Qualitative feedback | Short, non-identifying participant comment |

Do not treat a 1–5 rating as a validated psychological measure. SUS may be added in a later round if the full standardized questionnaire and scoring procedure are used consistently; do not selectively rewrite its items.

### Per-session note sheet

| Field | Entry |
|---|---|
| Participant code | P__ |
| Date / device | |
| Prototype version | |
| AI state (live / fallback / unavailable) | |
| T1 outcome / notes | |
| T2 outcome / notes | |
| T3 outcome / notes | |
| T4 comprehension | |
| T5 outcome / notes | |
| T6 comprehension | |
| Assistance provided | |
| Main friction points | |
| Participant suggestions | |
| Researcher observations (separate from interpretation) | |

## 10. Issue severity rubric

| Severity | Definition | Example |
|---|---|---|
| Critical | Creates a serious privacy, security, or safety risk, or exposes another user's data. | A test account can access another user's journal. |
| High | Blocks a core task or causes a materially misleading understanding. | User cannot save an entry, or mistakes an AI inference for a verified fact because the UI obscures its source. |
| Medium | Causes repeated confusion, avoidable errors, or substantial friction. | Users cannot find the search control without help. |
| Low | Minor wording, layout, or polish issue with a workable alternative. | A label is unclear but users can still complete the task. |

Any suspected privacy or cross-account access issue should stop testing with real accounts until investigated. Do not attempt to inspect another person's data.

## 11. Analysis approach

After sessions:

1. Consolidate observations by task, not by participant identity.
2. Separate direct observations, participant quotations, and researcher interpretations.
3. Count task outcomes descriptively (for example, 4 of 6 completed independently). Always show the denominator.
4. Summarize recurring friction points and representative anonymized comments.
5. Assign severity using the rubric above.
6. Recommend a design change and link it to the observation that motivates it.
7. Note contradictory feedback and cases where a proposed change may create a new trade-off.
8. Record limitations, including sample size, device mix, prototype version, and unavailable features.

Do not claim statistical significance, clinical benefit, or broad user preference from this small formative sample.

## 12. Reporting template

When the study is actually conducted, publish a separate report containing:

- Study date and prototype version
- Recruitment method and number of participants
- Inclusion criteria and relevant limitations
- Consent and privacy procedure
- Device and AI availability conditions
- Tasks and measures used
- Task completion counts with denominators
- Key usability issues and severity
- Anonymized participant feedback
- Changes made or planned, linked to evidence
- Limitations and unresolved questions

Never fill this template with invented participants, scores, quotations, or findings.

## 13. Exit criteria for the first round

The first round is ready to conclude when:

- Every planned task has been attempted or explicitly marked not testable.
- Critical privacy or safety concerns have been escalated.
- The most important usability issues have an owner or next action.
- Findings are separated from assumptions.
- The report states what the small sample cannot establish.

## 14. Next iteration

Prioritize fixes for critical and high-severity issues first. Then repeat the affected tasks with a fresh or clearly identified prototype version. Keep a simple change log:

| Version | Observed issue | Change made | Retest result |
|---|---|---|---|
| | | | |

**Principle:** The purpose of formative testing is not to prove that Mana is good. It is to discover where the experience is confusing, misleading, inaccessible, or insufficiently respectful of user control—and improve it using evidence.
