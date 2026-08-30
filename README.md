# AI/ML Learning & Career Journal

A futuristic, user-authenticated AI journaling command center built for **Farjana Ferdausi** to track her journey transitioning from 14+ years in Human Resources to AI/ML Engineering.

🔗 Live Web App URL : https://ai-ml-learning-career-journal.ai.studio

---

## 🌟 Overview & Features

- **Personalized AI/ML Command Center**: Welcome message personalized for Farjana, with sci-fi glassmorphism, 3D holographic AI orb, and live status telemetry (`AI/ML COACH — ONLINE`).
- **Career Transition Tracker**: Visual pipeline representing the transition from 14+ years of HR leadership to AI/ML Engineering, tracking concurrent progress across **Ostad**, **CodeBasics**, **Google Cloud Gen AI Academy**, and **CodeAlpha**.
- **Interactive Multi-Turn AI Coach**: Powered by Google Gemini (`@google/genai`) with fallback ladder resilience. The AI Coach provides deep technical insights (PyTorch, transformers, mathematical intuition) alongside strategic analogies linking HR systems thinking with neural architectures.
- **Unlimited Custom Study Topics**: Default topics (*Deep Learning*, *PyTorch*, *Transformers*, *LLM Systems*, *Fine-Tuning*, *Mathematics*) with inline creation, real-time activation toggling, and deletion synced to Firestore.
- **Automated Structured Summarization**: Generates comprehensive session takeaways (*what was learned*, *what was worked on*, *friction points*, *accomplishments*, *key takeaway*, *goal for tomorrow*, and *career transition progress note*).
- **Chronological Learning Timeline**: Searchable, topic-filtered archive of past mentoring sessions with expandable transcripts and celebratory confetti.
- **Firebase Authentication & Firestore Security**: Google Sign-In with isolated user document security rules.

---

## 🛡️ Agentic Threat Modeling & Security Summary

| Threat Zone | Identified Risk | Countermeasure Implemented |
| :--- | :--- | :--- |
| **Input Surfaces** | Malformed request bodies, empty prompts, non-JSON payloads | Strict JSON validation, defensive null-safe destructuring, and explicit parameterization. |
| **Planning & Reasoning** | Prompt injection / unexpected output formats | Hardened system instructions, `responseMimeType: 'application/json'`, and regex-cleaned fallback parsers. |
| **Tool Execution & APIs** | API key leakage in client browser, quota exhaustion | Zero frontend API keys. Server-side Gemini proxy with multi-model fallback ladder (`gemini-3.6-flash` → `gemini-3.1-flash-lite` → `gemini-flash-latest` → `gemini-3.7-flash` → `gemini-3.1-pro-preview`). |
| **Memory & State** | Cross-user data leakage in Firestore | Strict owner-bound Firestore security rules (`request.auth.uid == userId`) and payload sanitizer stripping all `undefined` values. |
| **Inter-System Comm** | HTML error responses breaking JSON clients (`Unexpected token '<'`) | Strict Express middleware ordering (`express.json()` first), explicit `Content-Type: application/json` headers on all `/api/*` endpoints, and defensive client response inspection. |

---

## 🔒 Firestore Security Rules

Deploy the following security rules to protect user journal data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🔑 Secret Manager Setup

Store your Gemini API key securely in Google Cloud Secret Manager:

```bash
# 1. Enable required Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com

# 2. Create the secret in Secret Manager
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# 3. Add your Gemini API key as a secret version
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 4. Grant Cloud Run runtime service account permission to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 🚀 Google Cloud Run Deployment

Deploy the containerized full-stack application to Cloud Run with automatic secret mounting:

```bash
# Build and deploy service
gcloud run deploy aiml-career-journal \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --port 3000
```

### 🏷️ Required Challenge Verification Binding

Apply the mandatory challenge label to register the service:

```bash
gcloud run services update aiml-career-journal \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=asia-southeast1
```

---

## 🧪 Comprehensive Walkthrough & Testing Guide

Follow these steps to verify all features:

1. **Sign In**:
   - Click **Connect Google Account** in the top navigation or auth modal.
   - Complete Google Sign-In via Firebase popup.
   - Confirm your profile image and personalized greeting ("*Welcome back, Farjana*") appear.

2. **Add Custom Study Topic**:
   - Click **+ Add Custom Topic** in the Study Focus Topics matrix.
   - Type a new topic (e.g., `CUDA Kernels` or `LoRA Fine-Tuning`) and press **Add**.
   - Confirm the new glowing chip is added and persists.

3. **Engage in Multi-Turn AI Coaching**:
   - Select active topics (e.g., *Deep Learning*, *PyTorch*).
   - Send a question or click a starter prompt (e.g., "*Explain Transformer Self-Attention using an HR talent routing analogy*").
   - Confirm the 3D Orb glows and the AI Coach generates structured, personalized responses with code and conceptual analogies.

4. **Complete Session & Generate Structured Summary**:
   - Click the glowing green **Complete Session** button.
   - Watch the celebratory confetti burst and inspect the synthesized modal (*What Was Learned*, *Accomplishments*, *Key Takeaway*, *Goal for Tomorrow*, and *Career Progress Note*).

5. **Verify Persistence & Timeline**:
   - Close the summary modal.
   - Scroll down to the **Learning Timeline** to inspect the newly archived session.
   - Expand the session card to review the full transcript.
   - Refresh the page to confirm all topics and sessions remain saved.

6. **Sign Out**:
   - Click the logout icon in the top header.
   - Confirm sign-out in the modal.
