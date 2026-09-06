# 💻 **AI/ML Learning & Career Journal**

A futuristic, user-authenticated AI journaling command center built for **Farjana Ferdausi** to track her journey transitioning from 14+ years in Human Resources to AI/ML Engineering.

🔗 Live Web App URL : https://ai-ml-learning-career-journal-1.ai.studio

---

## 🌟 Overview & Features

- **Personalized AI/ML Command Center**: Welcome message personalized for Farjana, with sci-fi glassmorphism, 3D holographic AI orb, and live status telemetry (`AI/ML COACH — ONLINE`).
- **Career Transition Tracker**: Visual pipeline representing the transition from 14+ years of HR leadership to AI/ML Engineering, tracking concurrent progress across **Ostad**, **CodeBasics**, **Google Cloud Gen AI Academy**, and **CodeAlpha**.
- **Interactive Multi-Turn AI Coach**: Powered by Google Gemini (`@google/genai`) with fallback ladder resilience. The AI Coach provides deep technical insights (PyTorch, transformers, mathematical intuition) alongside strategic analogies linking HR systems thinking with neural architectures.
- **Proactive Focus Suggestions**: Automatically evaluates active study topics and recent journal sessions before starting a study block, recommending precise technical priorities and one-click starter prompts. Also supports direct queries: *"What should I focus on today?"*
- **Weak-Skill Detection**: Analyzes past session transcripts and friction points to identify recurring struggle areas, surfacing a targeted *"Needs More Practice"* panel with one-click interactive coaching drills.
- **Career Intelligence Engine**: Computes overall progress toward **AI/ML Engineer**, identifies missing foundational & production skill areas based on market requirements, recommends custom portfolio projects, and highlights strategic HR leadership advantages.
- **AI Journal Trends Analysis**: Dedicated *Trends* tab providing natural language velocity insights, study consistency telemetry, top topic breakdowns, strengths identified, and growth opportunities over time.
- **Unlimited Custom Study Topics**: Default topics (*Deep Learning*, *PyTorch*, *Transformers*, *LLM Systems*, *Fine-Tuning*, *Mathematics*) with inline creation, real-time activation toggling, and deletion synced to Firestore.
- **Automated Structured Summarization**: Generates comprehensive session takeaways (*what was learned*, *what was worked on*, *friction points*, *accomplishments*, *key takeaway*, *goal for tomorrow*, and *career transition progress note*).
- **Location-Aware Journal Entries (Google Maps Platform)**: Optional study venue tagging for every journal session with interactive map-pinning, Google Places search, browser geolocation GPS, timeline location badges, and Google Maps direction links.
- **Chronological Learning Timeline**: Searchable, topic-filtered archive of past mentoring sessions with expandable transcripts, study venue badges, and celebratory confetti.
- **Firebase Authentication & Firestore Security**: Google Sign-In with isolated user document security rules.

---

## 🛡️ Agentic Threat Modeling & Security Summary

| Threat Zone | Identified Risk | Countermeasure Implemented |
| :--- | :--- | :--- |
| **Input Surfaces** | Malformed request bodies, empty prompts, non-JSON payloads | Strict JSON validation, defensive null-safe destructuring, and explicit parameterization. |
| **Planning & Reasoning** | Prompt injection / unexpected output formats | Hardened system instructions, `responseMimeType: 'application/json'`, and regex-cleaned fallback parsers. |
| **Tool Execution & APIs** | API key leakage in client browser, quota exhaustion | Zero frontend API keys in source. Server-side Gemini proxy with multi-model fallback ladder. Google Maps API key loaded dynamically via backend `/api/maps/config` endpoint with domain locking and graceful fallback. |
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

Store your Gemini API key and Google Maps API key securely in Google Cloud Secret Manager:

```bash
# 1. Enable required Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com

# 2. Create the secrets in Secret Manager
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
gcloud secrets create GOOGLE_MAPS_API_KEY --replication-policy="automatic"

# 3. Add your API keys as secret versions
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-
echo -n "YOUR_GOOGLE_MAPS_API_KEY" | gcloud secrets versions add GOOGLE_MAPS_API_KEY --data-file=-

# 4. Grant Cloud Run runtime service account permission to read the secrets
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding GOOGLE_MAPS_API_KEY \
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
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest,GOOGLE_MAPS_API_KEY=GOOGLE_MAPS_API_KEY:latest \
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

2. **Proactive AI Coach Suggestion (Focus Today)**:
   - On the Home Dashboard, observe the **AI Focus Recommendation** card.
   - Notice the AI-generated recommended focus topic, rationale based on recent study history, and key takeaways.
   - Click **Begin Recommended Focus** to immediately seed the AI Coach with the tailored study prompt, or click **"Ask Coach: What should I focus on today?"** to trigger direct coaching dialogue.

3. **Weak-Skill Detection (Needs More Practice)**:
   - On the Home Dashboard, view the **Needs More Practice** card.
   - Inspect detected friction areas (e.g., *Backpropagation Calculus*, *Multi-Head Dimension Transformations*) extracted from past session friction logs.
   - Click **Practice with Coach** on any item to start an interactive, step-by-step coaching drill for that specific topic.

4. **Career Intelligence & Target Role Gap Analysis**:
   - Navigate to the **Roadmap** tab via the sidebar or top navigation.
   - Inspect the **Career Intelligence Engine** card displaying:
     - Estimated progress percentage toward **AI/ML Engineer**.
     - Missing skill areas categorized by importance (*Essential*, *Recommended*, *Advanced*) with rationales.
     - Suggested next production portfolio project with key technologies and learning outcomes.
     - Strategic advantage section linking 14+ years of HR talent management to AI engineering.
   - Click **Discuss & Architect with Coach** to brainstorm the recommended project.

5. **AI Journal Trends Analysis**:
   - Navigate to the **Trends** tab in the sidebar or mobile menu.
   - View synthesized velocity trends (*Accelerating* / *Consistent*), key natural language consistency notes, top studied topics with logged hours, and identified strengths/growth opportunities.
   - Click **Refresh Analysis** to re-synthesize trends on demand.

6. **Add Custom Study Topic**:
   - Click **+ Add Custom Topic** in the Study Focus Topics matrix.
   - Type a new topic (e.g., `CUDA Kernels` or `LoRA Fine-Tuning`) and press **Add**.
   - Confirm the new glowing chip is added and persists in Firestore.

7. **Engage in Multi-Turn AI Coaching**:
   - Select active topics (e.g., *Deep Learning*, *PyTorch*).
   - Send a question or click a starter prompt (e.g., "*Explain Transformer Self-Attention using an HR talent routing analogy*").
   - Confirm the 3D Orb glows and the AI Coach generates structured, personalized responses with code and conceptual analogies.

8. **Complete Session & Generate Structured Summary**:
   - Click the glowing green **Complete Session** button.
   - Watch the celebratory confetti burst and inspect the synthesized modal (*What Was Learned*, *Accomplishments*, *Key Takeaway*, *Goal for Tomorrow*, and *Career Progress Note*).
   - Confirm the proactive suggestions, weak skills, and trends update with the new session data.

9. **Tag Study Location with Google Maps**:
   - In the session completion modal (or from the Learning Timeline card), click **+ Add Location**.
   - Use Google Places search (e.g., search "*MIT Stata Center*", "*Local Public Library*", or "*Starbucks*") or click **Use Current Location (GPS)**.
   - Click anywhere on the interactive Google Map to adjust your pin, then click **Attach Study Location**.
   - Notice the location badge appear on the session summary and timeline card header.
   - Click the venue badge on the timeline to preview coordinates, or click **View on Google Maps** to open exact driving directions.

10. **Verify Persistence & Timeline**:
   - Close the summary modal.
   - Scroll down to the **Learning Timeline** to inspect the newly archived session with its venue badge.
   - Expand the session card to review the full transcript and study venue block.
   - Refresh the page to confirm all topics, sessions, and location tags remain saved in Firestore.

11. **Sign Out**:
   - Click the logout icon in the top header.
   - Confirm sign-out in the modal.

## 🖊️ Author

**Farjana Ferdausi**

AI/ML Engineering & Data Science, Fellow — Google Cloud Gen AI Academy APAC Edition (Cohort 3) | Agentic AI · RAG · Gemini · ADK · BigQuery MCP · Cloud Run | Former HR Professional (14+ years) at Radisson Blu Dhaka Water Garden, Bangladesh

LinkedIn Profile: https://www.linkedin.com/in/farjana-ferdausi/

Medium Blog Link: https://medium.com/@farjana.rafi1983/from-hr-to-ai-ml-how-i-built-a-production-grade-learning-journal-on-google-cloud-38627356026d

Medium Profile: https://medium.com/@farjana.rafi1983
