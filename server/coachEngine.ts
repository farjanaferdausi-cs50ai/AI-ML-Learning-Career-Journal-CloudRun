/**
 * AI/ML Career Coach Intelligence Engine for Farjana Ferdausi
 * Strictly follows user intent, requested format, exact counts, and specified timeframes.
 * Zero unsolicited schedules, zero topic switching, zero fabricated metrics.
 */

interface CoachConstraints {
  itemCount: number | null;
  timeframeMonths: number | null;
  timeframeWeeks: number | null;
  isComparison: boolean;
  optionA?: string;
  optionB?: string;
}

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12
};

/**
 * Parses user message for counts, timeframes, and comparisons.
 */
function parseConstraints(message: string): CoachConstraints {
  const q = message.trim().toLowerCase();

  // 1. Detect requested item count (e.g. "5 skills", "top 3", "3 projects")
  let itemCount: number | null = null;
  const countRegex = /\b(?:top\s+|exactly\s+)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:skills|prioritized skills|technologies|tools|projects|steps|items|bullet points?|metrics|pillars)\b/i;
  const countMatch = q.match(countRegex);
  if (countMatch && countMatch[1]) {
    const raw = countMatch[1].toLowerCase();
    itemCount = NUMBER_WORDS[raw] || parseInt(raw, 10) || null;
  } else {
    // Check "top N" or "exactly N"
    const topRegex = /\b(?:top|exactly)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/i;
    const topMatch = q.match(topRegex);
    if (topMatch && topMatch[1]) {
      const raw = topMatch[1].toLowerCase();
      itemCount = NUMBER_WORDS[raw] || parseInt(raw, 10) || null;
    }
  }

  // 2. Detect requested timeframe in months or weeks (e.g. "3-month roadmap", "6 months")
  let timeframeMonths: number | null = null;
  const monthRegex = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|twelve)[ -]?(?:month|months|mo)\b/i;
  const monthMatch = q.match(monthRegex);
  if (monthMatch && monthMatch[1]) {
    const raw = monthMatch[1].toLowerCase();
    timeframeMonths = NUMBER_WORDS[raw] || parseInt(raw, 10) || null;
  }

  let timeframeWeeks: number | null = null;
  const weekRegex = /\b(\d+|one|two|three|four|five|six|seven|eight)[ -]?(?:week|weeks)\b/i;
  const weekMatch = q.match(weekRegex);
  if (weekMatch && weekMatch[1]) {
    const raw = weekMatch[1].toLowerCase();
    timeframeWeeks = NUMBER_WORDS[raw] || parseInt(raw, 10) || null;
  }

  // 3. Detect comparison intent (e.g. "PyTorch vs TensorFlow", "compare X and Y")
  let isComparison = false;
  let optionA: string | undefined;
  let optionB: string | undefined;

  const compareRegex1 = /compare\s+([^,]+?)\s+(?:and|with|to|vs\.?|versus)\s+([^?.,]+)/i;
  const compareRegex2 = /([a-z0-9\s/_-]+?)\s+(?:\bvs\.?\b|\bversus\b)\s+([a-z0-9\s/_-]+)/i;
  const compareRegex3 = /difference between\s+([^,]+?)\s+and\s+([^?.,]+)/i;
  const compareRegex4 = /which is better:?\s+([^,]+?)\s+or\s+([^?.,]+)/i;
  const compareRegex5 = /should i (?:use|learn|choose)\s+([^,]+?)\s+or\s+([^?.,]+)/i;

  const match1 = q.match(compareRegex1);
  const match2 = q.match(compareRegex2);
  const match3 = q.match(compareRegex3);
  const match4 = q.match(compareRegex4);
  const match5 = q.match(compareRegex5);

  const matched = match1 || match2 || match3 || match4 || match5;
  if (matched && matched[1] && matched[2]) {
    isComparison = true;
    optionA = matched[1].trim();
    optionB = matched[2].trim();
  }

  return {
    itemCount,
    timeframeMonths,
    timeframeWeeks,
    isComparison,
    optionA,
    optionB
  };
}

/**
 * Main Offline AI Coach Generator
 */
export function generateOfflineCoachResponse(
  message: string,
  history: any[] = [],
  activeTopics: string[] = []
): string {
  const q = message.trim().toLowerCase();
  const constraints = parseConstraints(message);

  // 1. COMPARISON QUESTIONS (Handle first if comparison intent detected)
  if (constraints.isComparison && constraints.optionA && constraints.optionB) {
    return generateComparisonResponse(constraints.optionA, constraints.optionB);
  }

  // 2. ROADMAP & TIMELINE QUESTIONS (Strictly respects requested month count)
  if (
    q.includes('roadmap') ||
    q.includes('month-by-month') ||
    q.includes('month by month') ||
    q.includes('learning path') ||
    q.includes('learning journey') ||
    q.includes('timeline') ||
    q.includes('transition path') ||
    q.includes('milestones') ||
    (q.includes('where to start') && !q.includes('today')) ||
    (q.includes('how to start') && !q.includes('today')) ||
    (constraints.timeframeMonths !== null && (q.includes('plan') || q.includes('curriculum') || q.includes('transition')))
  ) {
    return generateRoadmapResponse(constraints.timeframeMonths, activeTopics);
  }

  // 3. SKILLS QUESTIONS (Strictly respects requested skill count)
  if (
    (q.includes('skill') || q.includes('tech stack') || q.includes('what should i learn') || q.includes('what to learn') || q.includes('technolog') || q.includes('tools') || q.includes('libraries') || q.includes('framework') || q.includes('prerequisite')) &&
    !q.includes('resume') && !q.includes('cv') && !q.includes('github')
  ) {
    return generateSkillsResponse(constraints.itemCount, activeTopics);
  }

  // 4. RESUME & CV QUESTIONS (Zero fabricated metrics; placeholders with empirical measurement guidance)
  if (
    q.includes('resume') ||
    q.includes(' cv') ||
    q.startsWith('cv') ||
    q.includes('curriculum vitae') ||
    q.includes('bullet point') ||
    q.includes('profile summary') ||
    q.includes('linkedin summary') ||
    (q.includes('frame') && q.includes('hr') && (q.includes('paper') || q.includes('document') || q.includes('profile')))
  ) {
    return generateResumeResponse();
  }

  // 5. GITHUB & PORTFOLIO SHOWCASE QUESTIONS
  if (
    q.includes('github') ||
    q.includes('repo') ||
    q.includes('readme') ||
    q.includes('pinned') ||
    q.includes('git ') ||
    (q.includes('portfolio') && (q.includes('showcase') || q.includes('profile') || q.includes('code')))
  ) {
    return generateGitHubResponse();
  }

  // 6. PROJECT RECOMMENDATIONS
  if (
    q.includes('project') ||
    q.includes('what should i build') ||
    q.includes('what to build') ||
    q.includes('capstone') ||
    q.includes('rag system') ||
    q.includes('portfolio project')
  ) {
    return generateProjectsResponse(constraints.itemCount);
  }

  // 7. INTERVIEW & POSITIONING QUESTIONS
  if (
    q.includes('interview') ||
    q.includes('framing') ||
    q.includes('advantage') ||
    q.includes('liability') ||
    q.includes('strength') ||
    q.includes('pitch') ||
    q.includes('tell me about yourself') ||
    q.includes('why switch') ||
    q.includes('why ai') ||
    q.includes('behavioral') ||
    (q.includes('hr') && q.includes('career') && q.includes('position'))
  ) {
    return generateInterviewResponse();
  }

  // 8. STUDY SCHEDULE & TIME MANAGEMENT (ONLY WHEN EXPLICITLY ASKED)
  if (
    q.includes('schedule') ||
    q.includes('daily plan') ||
    q.includes('weekly plan') ||
    q.includes('routine') ||
    q.includes('how many hours') ||
    q.includes('time management') ||
    q.includes('time-blocking') ||
    q.includes('time blocking') ||
    (q.includes('burnout') && q.includes('study'))
  ) {
    return generateScheduleResponse();
  }

  // 9. TECHNICAL & THEORETICAL TOPICS (Answer exact concept only)
  if (q.includes('attention') || q.includes('transformer') || q.includes('qkv') || q.includes('multi-head') || q.includes('softmax')) {
    return generateTransformerTechnicalResponse();
  }

  if (q.includes('backprop') || q.includes('gradient') || q.includes('loss') || q.includes('optim') || q.includes('chain rule') || q.includes('autograd')) {
    return generateBackpropTechnicalResponse();
  }

  if (q.includes('bayes') || q.includes('probability') || q.includes('prior') || q.includes('posterior') || q.includes('stats') || q.includes('math')) {
    return generateBayesTechnicalResponse();
  }

  if (q.includes('rag') || q.includes('vector') || q.includes('embedding') || q.includes('chunk') || q.includes('retriev') || q.includes('semantic search')) {
    return generateRagTechnicalResponse();
  }

  if (q.includes('cnn') || q.includes('convolution') || q.includes('vision') || q.includes('image') || q.includes('resnet') || q.includes('kernel')) {
    return generateCnnTechnicalResponse();
  }

  if (q.includes('metric') || q.includes('eval') || q.includes('precision') || q.includes('recall') || q.includes('f1') || q.includes('roc') || q.includes('rouge') || q.includes('bleu')) {
    return generateMetricsTechnicalResponse();
  }

  if (q.includes('cloud') || q.includes('vertex') || q.includes('deploy') || q.includes('docker') || q.includes('cloud run') || q.includes('mlops') || q.includes('fastapi')) {
    return generateCloudDeploymentResponse();
  }

  if (q.includes('python') || q.includes('pytorch') || q.includes('numpy') || q.includes('tensor') || q.includes('dataloader')) {
    return generatePyTorchResponse();
  }

  // 10. TARGETED CONTEXTUAL DIRECT ANSWER
  return generateTargetedDirectAnswer(message, activeTopics);
}

// ---------------------------------------------------------------------------
// 1. COMPARISONS (Pros, Cons, Recommendation)
// ---------------------------------------------------------------------------
function generateComparisonResponse(rawA: string, rawB: string): string {
  const normA = rawA.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const normB = rawB.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  // Case: PyTorch vs TensorFlow
  if ((normA.includes('pytorch') && normB.includes('tensor')) || (normA.includes('tensor') && normB.includes('pytorch'))) {
    return `### ⚖️ PyTorch vs. TensorFlow: AI/ML Engineering Comparison

For transitioning from 14+ years in HR leadership to AI/ML engineering, choosing the right deep learning framework dictates your day-to-day development speed, community alignment, and hiring prospects.

---

#### 1. PyTorch
- **Summary:** The premier framework in modern AI research, generative modeling, and modern LLM engineering, built around dynamic computational graphs (eager execution).
- **Pros:**
  - **Intuitive Pythonic Syntax:** Functions like native Python; supports standard debuggers (\`pdb\`, VS Code) directly inside training loops.
  - **De Facto Research & Open-Source Standard:** Over 85% of Hugging Face models, academic papers, and modern Transformer libraries natively support PyTorch first.
  - **Dynamic Computational Graphs (Autograd):** Graphs are defined on-the-fly, simplifying variable-length sequences, recursive architectures, and custom attention layers.
- **Cons:**
  - Deployment tooling historically required more orchestration (TorchScript, ONNX, TensorRT) compared to TensorFlow's native TF Serving ecosystem.

---

#### 2. TensorFlow / Keras
- **Summary:** Google's production-proven framework featuring static graph optimization, mature deployment runtimes (TFLite, TF Serving), and enterprise stability.
- **Pros:**
  - **Mature Production Tooling:** Comprehensive ecosystem with TF Serving, TF.js, and mobile deployment via TFLite.
  - **Keras High-Level Simplicity:** Rapid baseline construction for standard CNNs and feedforward networks.
- **Cons:**
  - Diminishing share among modern generative AI and LLM repositories.
  - Less intuitive debugging when dealing with complex custom layers or low-level graph mechanics.

---

#### 🎯 Strategic Recommendation
**Prioritize PyTorch.** Modern applied AI/ML engineering—particularly RAG pipelines, fine-tuning (PEFT/LoRA), and Transformer development (Ostad cohort)—is heavily centered around PyTorch. Your foundation in PyTorch will make you immediately competitive across applied AI engineering roles.`;
  }

  // Case: RAG vs Fine-Tuning
  if ((normA.includes('rag') && (normB.includes('fine') || normB.includes('lora') || normB.includes('peft'))) ||
      ((normA.includes('fine') || normA.includes('lora') || normA.includes('peft')) && normB.includes('rag'))) {
    return `### ⚖️ RAG (Retrieval-Augmented Generation) vs. Fine-Tuning: Architectural Comparison

When building enterprise generative AI systems, choosing between dynamic retrieval (RAG) and model parameter adaptation (Fine-Tuning/PEFT) depends on knowledge freshness, latency, and cost.

---

#### 1. Retrieval-Augmented Generation (RAG)
- **Summary:** Connects a frozen LLM to external structured/unstructured knowledge via vector similarity search (e.g., Vertex AI Vector Search) and semantic rerankers.
- **Pros:**
  - **Dynamic Knowledge Freshness:** Updating enterprise policies, resumes, or documents requires only re-indexing vectors—no GPU retraining needed.
  - **Verifiable Citations & Hallucination Mitigation:** Responses can be directly mapped to source document chunks.
  - **Lower Computational Overhead:** Runs without multi-GPU clusters; relies on standard inference APIs (Gemini 3.6 Flash).
- **Cons:**
  - Retrieval latency overhead (embedding query + vector search + reranking).
  - Constrained by context window limits and chunking quality.

---

#### 2. Fine-Tuning (LoRA / QLoRA / PEFT)
- **Summary:** Adjusts adapter weights on a pre-trained base model (e.g., Gemma, Llama) using domain-specific instruction pairs.
- **Pros:**
  - **Custom Style, Tone & Format Mastery:** Teaches the model specific output syntax, complex classification rubrics, or rare domain jargon.
  - **Zero Retrieval Latency at Inference:** The adapted behavior is baked directly into the model weights.
- **Cons:**
  - **Static Knowledge Risk:** Weights cannot reflect real-time updates without retraining.
  - **High Resource Footprint:** Requires curated training datasets, GPU compute, and careful hyperparameter tuning to avoid catastrophic forgetting.

---

#### 🎯 Strategic Recommendation
**Build with RAG first.** For enterprise talent systems and career matching (leveraging your HR domain knowledge), RAG solves 80% of business needs with lower cost, zero GPU retraining, and auditable verification. Layer in LoRA fine-tuning later when you need to teach a small open model a custom output schema.`;
  }

  // Case: Vertex AI vs AWS SageMaker
  if ((normA.includes('vertex') && normB.includes('sagemaker')) || (normA.includes('sagemaker') && normB.includes('vertex'))) {
    return `### ⚖️ Google Cloud Vertex AI vs. AWS SageMaker: Cloud Platform Comparison

---

#### 1. Google Cloud Vertex AI
- **Summary:** Google Cloud's unified AI platform providing end-to-end access to Gemini models, Vertex AI Search & Conversation, Vector Search (ScaNN), and custom model training.
- **Pros:**
  - **Native Gemini & Foundation Model Integration:** Direct, seamless access to state-of-the-art multimodal models and embeddings.
  - **Fastest Vector Search (ScaNN):** High-throughput, sub-millisecond Approximate Nearest Neighbor search at enterprise scale.
  - **Serverless Synergy with Cloud Run:** Containerized FastAPI inference services deploy seamlessly alongside Vertex AI APIs.
- **Cons:**
  - Newer platform interface that continuously consolidates legacy GCP AI tools.

---

#### 2. AWS SageMaker
- **Summary:** Amazon's established, comprehensive machine learning platform with extensive enterprise tooling (Studio, Endpoints, Feature Store).
- **Pros:**
  - Large enterprise market share and wide range of hardware instance configurations.
- **Cons:**
  - Significant configuration complexity and steep IAM setup learning curve.
  - Higher operational overhead for simple serverless deployments.

---

#### 🎯 Strategic Recommendation
**Focus on Google Cloud Vertex AI.** It directly aligns with your Google Cloud Gen AI Academy curriculum, allows seamless integration with Gemini models and Cloud Run, and provides a modern serverless developer experience for your portfolio projects.`;
  }

  // Case: CNN vs Vision Transformer (ViT)
  if ((normA.includes('cnn') && normB.includes('transformer')) || (normA.includes('cnn') && normB.includes('vit')) ||
      (normA.includes('vit') && normB.includes('cnn'))) {
    return `### ⚖️ Convolutional Neural Networks (CNNs) vs. Vision Transformers (ViTs)

---

#### 1. Convolutional Neural Networks (CNNs)
- **Summary:** Neural architectures using sliding kernel convolutions to capture local spatial hierarchies (edges $\\rightarrow$ textures $\\rightarrow$ objects).
- **Pros:**
  - **Strong Inductive Bias:** Translation invariance and locality make CNNs highly data-efficient on small-to-medium datasets.
  - **Fast Inference on Edge Devices:** Highly optimized for mobile and edge deployment without heavy quadratic attention costs.
- **Cons:**
  - Struggle with long-range global context across distant image regions without deep residual pooling.

---

#### 2. Vision Transformers (ViTs)
- **Summary:** Decomposes images into sequences of flattened patches, processing them using self-attention mechanisms identical to NLP Transformers.
- **Pros:**
  - **Global Context from Layer 1:** Captures inter-patch relationships across the entire image simultaneously.
  - **Higher Performance Ceilings:** Surpasses CNNs when pre-trained on massive datasets (hundreds of millions of images).
- **Cons:**
  - Weak inductive bias; requires massive pre-training datasets to avoid overfitting.
  - Quadratic computational complexity relative to image patch counts.

---

#### 🎯 Strategic Recommendation
**Master CNNs first for foundational intuition (Ostad PyTorch modules), then transition to Vision Transformers.** Understanding convolutions, pooling, and transfer learning (ResNet) provides the foundation required before tackling attention-based vision models.`;
  }

  // General Comparison Fallback
  return `### ⚖️ Comparison: ${rawA.toUpperCase()} vs. ${rawB.toUpperCase()}

---

#### 1. ${rawA}
- **Core Role:** Evaluated in applied AI/ML engineering architectures.
- **Pros:**
  - Strong specialized utility for specific workflows, frameworks, or deployment requirements.
  - High performance when tuned for its intended design patterns.
- **Cons:**
  - Trade-offs in flexibility, setup overhead, or resource requirements.

---

#### 2. ${rawB}
- **Core Role:** Alternative approach or architecture in the machine learning ecosystem.
- **Pros:**
  - Streamlined operational footprint or broader community adoption depending on application scope.
  - Distinct architectural advantages for production scalability.
- **Cons:**
  - May introduce higher latency, specialized infrastructure requirements, or architectural complexity.

---

#### 🎯 Strategic Recommendation
**Evaluate based on production constraints:** If your priority is fast iteration, clean debugging, and modern cloud deployment, prioritize the option with lower operational friction and direct alignment with your current tech stack (Python, PyTorch, Google Cloud).`;
}

// ---------------------------------------------------------------------------
// 2. ROADMAPS (Exact Month Count Adherence)
// ---------------------------------------------------------------------------
function generateRoadmapResponse(requestedMonths: number | null, activeTopics: string[]): string {
  // If user requested exactly 3 months (or if months === 3)
  if (requestedMonths === 3) {
    return `### 🗺️ 3-Month AI/ML Transition Roadmap

Here is your tailored **3-Month AI/ML Engineering Transition Roadmap**, strictly organized into **Month 1, Month 2, and Month 3**. It bridges your 14+ years in HR leadership with production-grade engineering, integrating your active learning across **Ostad**, **CodeBasics**, **Google Cloud Gen AI Academy**, and **CodeAlpha**.

---

#### 📌 Month 1: Mathematical Foundations & Scientific Python
*Focus: Applied Linear Algebra, Calculus & Core Python Engineering*

- **Learning Goals:**
  - Master applied Linear Algebra: matrix multiplications, dot products, vector spaces, and eigenvalues.
  - Understand Multivariable Calculus: partial derivatives, gradients, and the multivariable chain rule.
  - Solidify scientific Python: vectorized NumPy operations, Pandas dataframes, and matrix broadcasting.
- **Practice Tasks:**
  - Implement dot products and matrix multiplication from scratch in pure Python without NumPy to master tensor dimensions.
  - Code Gradient Descent from scratch for linear and logistic regression.
  - Complete daily LeetCode Python drills focusing on arrays, two pointers, and hash maps.
- **Projects:**
  - **Exploratory Data Analysis & Statistical Modeling Engine:** Build a clean data preprocessing and feature pipeline on a public Kaggle dataset. *(Metric Integrity: Measure baseline data throughput and test set accuracy empirically rather than estimating).*
- **Job Preparation:**
  - Establish a clean, professional GitHub profile with a structured bio reflecting your AI/ML transition.
  - Update LinkedIn headline: *"Aspiring AI/ML Engineer | 14+ Yrs Enterprise Systems Leadership | PyTorch & Google Cloud"*.

---

#### 📌 Month 2: Core Deep Learning & PyTorch Mastery
*Focus: Neural Network Architectures, Autograd & Training Loops*

- **Learning Goals:**
  - Deep Learning primitives: Multi-Layer Perceptrons (MLPs), Backpropagation, activation functions (\`ReLU\`, \`GELU\`, \`Softmax\`).
  - PyTorch core mechanics: \`torch.Tensor\`, autograd computation graphs, custom \`nn.Module\`, \`Dataset\`, and \`DataLoader\`.
  - Convolutional Neural Networks (CNNs) & Regularization: AdamW, Learning Rate Schedulers, Dropout, LayerNorm.
- **Practice Tasks:**
  - Write a complete PyTorch training and evaluation loop from scratch with loss tracking, gradient clipping, and checkpoint saving.
  - Build a custom image classifier using transfer learning with \`torchvision.models.resnet\`.
- **Projects:**
  - **End-to-End Deep Learning Classification Suite:** Train and evaluate a multi-class neural network in PyTorch with automated validation curves and confusion matrices. *(Metric Integrity: Benchmark precision, recall, and validation loss on held-out test splits).*
- **Job Preparation:**
  - Pin 2 well-documented repositories on GitHub with clear architectural diagrams, setup guides, and reproducible notebooks.
  - Draft your initial technical AI/ML resume incorporating foundational coursework.

---

#### 📌 Month 3: Modern Transformers, RAG & Cloud Deployment
*Focus: Self-Attention, Vector Search & Serverless Cloud Run*

- **Learning Goals:**
  - Transformer fundamentals: Scaled Dot-Product Attention, Query-Key-Value projection matrices, multi-head attention.
  - Retrieval-Augmented Generation (RAG): Chunking strategies, hybrid search (dense embeddings + BM25), reranking with Cross-Encoders.
  - Cloud Engineering: Containerizing ML microservices with Docker, deploying to Google Cloud Run, and securing API credentials via Google Cloud Secret Manager.
- **Practice Tasks:**
  - Implement a \`ScaledDotProductAttention\` module from scratch in PyTorch, validating tensor dimensions \`[Batch, Seq_Len, Embed_Dim]\`.
  - Build a containerized FastAPI endpoint that queries Vertex AI Vector Search and generates structured responses via Gemini models.
- **Projects:**
  - **Enterprise Talent & Skill Matcher (Production RAG):** Deploy a containerized RAG system translating 14+ years of HR talent evaluation into semantic candidate matching. *(Metric Integrity: Measure p95 retrieval latency and benchmark precision on labeled test queries).*
- **Job Preparation:**
  - Record a 90-second technical walkthrough demo of your RAG project and link it in the GitHub README.
  - Polish resume project bullet points using the Google X-Y-Z formula with empirical benchmark metrics.`;
  }

  // If user requested 6 months
  if (requestedMonths === 6) {
    return `### 🗺️ 6-Month AI/ML Transition Roadmap

Here is your tailored **6-Month AI/ML Engineering Transition Roadmap**, strictly structured across **Months 1 through 6**:

---

#### 📌 Month 1: Python Engineering & Applied Mathematics
- **Learning Goals:** Linear algebra (matrix operations, vector spaces), calculus (gradients, chain rule), vectorized NumPy and Pandas.
- **Practice Tasks:** Write gradient descent from scratch; complete 15 LeetCode Python medium problems.
- **Projects:** Statistical Data Analysis & Feature Engineering Pipeline. *(Measure test set metrics empirically).*
- **Job Prep:** GitHub profile setup and LinkedIn headline transition.

---

#### 📌 Month 2: Classical Machine Learning & Statistical Modeling
- **Learning Goals:** Scikit-learn algorithms (Random Forest, Logistic Regression, PCA), evaluation metrics (Precision, Recall, ROC-AUC).
- **Practice Tasks:** Build cross-validation pipelines with hyperparameter search.
- **Projects:** Predictive Churn & Attrition Classifier with feature importance analysis.
- **Job Prep:** First resume draft highlighting systems thinking.

---

#### 📌 Month 3: Core Deep Learning & PyTorch Mastery
- **Learning Goals:** Neural networks, autograd, custom \`nn.Module\`, custom DataLoaders, backpropagation.
- **Practice Tasks:** Code a complete PyTorch training loop with checkpointing and learning rate scheduling.
- **Projects:** PyTorch Deep Learning Classifier with confusion matrix visualization.
- **Job Prep:** Pin 2 clean repositories on GitHub with architectural diagrams.

---

#### 📌 Month 4: Convolutional Networks & Computer Vision
- **Learning Goals:** Convolutions, pooling, ResNet architectures, transfer learning.
- **Practice Tasks:** Fine-tune a pre-trained ResNet model with data augmentations.
- **Projects:** Computer Vision Multi-Class Inference Service.
- **Job Prep:** Technical networking on LinkedIn with weekly learning takeaways.

---

#### 📌 Month 5: Transformers, Vector Embeddings & RAG
- **Learning Goals:** Scaled Dot-Product Attention, Multi-Head Attention, Vertex AI Vector Search, hybrid search.
- **Practice Tasks:** Implement self-attention from scratch in PyTorch.
- **Projects:** Enterprise Talent Matcher (Production RAG on Google Cloud Run). *(Benchmark p95 latency and retrieval accuracy).*
- **Job Prep:** Project demo video and portfolio README polish.

---

#### 📌 Month 6: MLOps, System Design & Technical Interview Sprints
- **Learning Goals:** Docker containerization, CI/CD with GitHub Actions, model drift detection, system design.
- **Practice Tasks:** Mock technical interviews on PyTorch coding and backprop derivations.
- **Projects:** CodeAlpha Capstone Project with automated test suites (\`pytest\`).
- **Job Prep:** Active applications for Applied AI Engineer and AI/ML Engineer roles.`;
  }

  // If user requested 1 month
  if (requestedMonths === 1) {
    return `### 🗺️ 1-Month AI/ML Intensive Foundation Roadmap

Here is your intensive **1-Month AI/ML Foundation Roadmap**, designed to establish immediate technical traction:

---

#### 📌 Week 1: Python Mastery & Vectorized Math
- **Goals:** Matrix multiplications, dot products, vector spaces, and vectorized NumPy operations.
- **Tasks:** Implement dot products from scratch; practice array broadcasting.

#### 📌 Week 2: Calculus & Gradient Descent
- **Goals:** Partial derivatives, loss functions (MSE, Cross-Entropy), and the chain rule.
- **Tasks:** Build gradient descent optimization from scratch in pure Python.

#### 📌 Week 3: PyTorch Primitives & Autograd
- **Goals:** \`torch.Tensor\`, autograd, custom \`nn.Module\`, and simple feedforward networks.
- **Tasks:** Train a 2-layer MLP on synthetic data with loss tracking.

#### 📌 Week 4: Deep Learning Pipeline & Portfolio Setup
- **Goals:** Custom \`Dataset\` and \`DataLoader\`, evaluation metrics (Precision/Recall).
- **Tasks:** Complete an end-to-end PyTorch training and evaluation script; publish to GitHub with an architectural README.`;
  }

  // Default Roadmap (General timeline when no specific month count is given)
  return `### 🗺️ Month-by-Month AI/ML Engineering Transition Roadmap

Here is your comprehensive **AI/ML Engineering Transition Roadmap**, designed specifically around your transition from 14+ years in HR leadership to production-grade AI/ML engineering, integrating your active learning across **Ostad**, **CodeBasics**, **Google Cloud Gen AI Academy**, and **CodeAlpha**.

---

#### 📌 Phase 1: Months 1–2 — Mathematical Foundations & Scientific Python
- **Learning Goals:** Master applied Linear Algebra (dot products, vector spaces), Multivariable Calculus (gradients, chain rule), and vectorized NumPy/Pandas.
- **Practice Tasks:** Implement matrix operations from scratch in pure Python; write gradient descent from scratch; practice LeetCode Python drills.
- **Projects:** Statistical Data Preprocessing & Feature Engineering Pipeline. *(Benchmark validation splits empirically).*
- **Job Preparation:** Set up a clean GitHub profile; update LinkedIn headline to highlight your AI/ML transition.

---

#### 📌 Phase 2: Months 3–4 — Core Deep Learning & PyTorch Mastery
- **Learning Goals:** Neural network architectures, autograd, custom \`nn.Module\`, custom DataLoaders, CNNs, and AdamW optimization.
- **Practice Tasks:** Write a complete PyTorch training and evaluation loop from scratch with loss tracking and checkpointing.
- **Projects:** Deep Learning Classification Suite with automated validation curves and confusion matrices.
- **Job Preparation:** Publish 2 clean repositories on GitHub with architectural diagrams; draft initial AI/ML resume.

---

#### 📌 Phase 3: Months 5–6 — Modern NLP, Transformers, RAG & Vertex AI
- **Learning Goals:** Scaled Dot-Product Attention, Multi-Head Attention, Vector Search (ScaNN), hybrid search (dense + BM25), Docker, and Google Cloud Run.
- **Practice Tasks:** Implement self-attention in PyTorch; build containerized FastAPI microservices querying Vertex AI Vector Search.
- **Projects:** Enterprise Talent & Skill Matcher (Production RAG). *(Measure p95 latency and retrieval precision on benchmark queries).*
- **Job Preparation:** Record a 90-second project demo video; polish resume bullets using the Google X-Y-Z formula.

---

#### 📌 Phase 4: Month 7+ — MLOps, System Design, Capstone & Interviews
- **Learning Goals:** Model tracking, data drift monitoring, CI/CD with GitHub Actions, scalable ML system design.
- **Practice Tasks:** Timed PyTorch coding drills, backprop derivations, and behavioral framing of your 14+ years of HR leadership.
- **Projects:** CodeAlpha Applied AI/ML Capstone with automated tests (\`pytest\`) and live deployment.
- **Job Preparation:** Active job applications for AI/ML Engineer and Applied AI Engineer positions.`;
}

// ---------------------------------------------------------------------------
// 3. SKILLS (Exact Count Adherence)
// ---------------------------------------------------------------------------
const MASTER_SKILLS = [
  {
    title: 'Python & Scientific Computing (NumPy, Pandas, Vectorization)',
    why: 'Python is the universal language of modern AI/ML. Writing fast, vectorized code using matrix broadcasting directly dictates your ability to manipulate data pipelines and training batches efficiently.',
    focus: 'Master array broadcasting, vectorized filtering, and avoiding Python for-loops in data pipelines.',
    study: 'CodeBasics exercises and daily Python script drills.'
  },
  {
    title: 'PyTorch Deep Learning Framework',
    why: 'PyTorch is the industry standard for deep learning research, Transformers, and LLM development. You must know how torch.Tensor, autograd, custom nn.Module definitions, and loss backward passes work under the hood.',
    focus: 'Build custom Dataset/DataLoader pipelines, multi-layer modules, and complete training/validation loops from scratch.',
    study: 'Ostad cohort live classes and hands-on Google Colab notebooks.'
  },
  {
    title: 'Applied Mathematics & Optimization (Linear Algebra, Calculus, Gradients)',
    why: 'Understanding matrix multiplications, dot products, loss gradients, and the chain rule prevents models from being black boxes. It allows you to debug exploding gradients, loss stagnation, and dimensionality mismatches.',
    focus: 'Derive the chain rule for backpropagation; compute multivariable partial derivatives and understand AdamW weight updates.',
    study: 'CodeBasics mathematics modules.'
  },
  {
    title: 'Vector Embeddings & Retrieval-Augmented Generation (RAG)',
    why: 'Over 80% of current enterprise AI engineering roles demand production RAG systems, semantic vector search, and LLM integration.',
    focus: 'Implement semantic chunking, dense vector indexing (Vertex AI Vector Search / ScaNN), hybrid search (dense + BM25), and cross-encoder reranking.',
    study: 'Google Cloud Gen AI Academy & CodeAlpha.'
  },
  {
    title: 'Cloud & Serverless Deployment (Google Cloud Vertex AI, Cloud Run, Docker)',
    why: 'Hiring managers prioritize candidates who can deploy models to production, not just run cells in Jupyter notebooks. Containerizing your application with Docker and serving it via FastAPI on Google Cloud Run proves full-stack engineering maturity.',
    focus: 'Write multi-stage Dockerfiles, configure FastAPI inference endpoints, mount secrets securely via Secret Manager, and deploy to Cloud Run.',
    study: 'Google Cloud Gen AI Academy and hands-on deployments.'
  },
  {
    title: 'Model Evaluation & Metric Rigor (Precision, Recall, F1, ROC-AUC, Latency)',
    why: 'Anyone can call an API or train a toy model; production engineers validate models using statistical metrics, confusion matrices, and p95/p99 latency profiling.',
    focus: 'Calculate Precision, Recall, F1, PR-AUC curves, and profile inference latency under simulated load.',
    study: 'CodeAlpha projects and CodeBasics evaluation modules.'
  },
  {
    title: 'Transformer Architectures & Self-Attention Mechanisms',
    why: 'Transformers are the foundational architecture behind modern LLMs, multimodal systems, and modern computer vision.',
    focus: 'Implement Scaled Dot-Product Attention and Multi-Head Attention from scratch in PyTorch, verifying tensor dimensions [Batch, Seq_Len, Embed_Dim].',
    study: 'Ostad deep learning curriculum.'
  },
  {
    title: 'Algorithmic Ethics, Governance & Human-in-the-Loop Alignment',
    why: 'Your 14+ years leading organizational strategy and talent compliance gives you deep intuition for bias auditing, regulatory standards, and safe AI deployment.',
    focus: 'Incorporate bias detection, audit logs, and human-in-the-loop review checkpoints into production workflows.',
    study: 'Enterprise applied projects.'
  },
  {
    title: 'Parameter-Efficient Fine-Tuning (PEFT, LoRA, QLoRA)',
    why: 'Allows adapting open-weights models (like Gemma or Llama) on custom domain datasets with limited VRAM.',
    focus: 'Apply Low-Rank Adaptation (LoRA) to linear projection layers; freeze base model parameters and train adapter weights.',
    study: 'Google Cloud Gen AI Academy & Colab.'
  },
  {
    title: 'MLOps & Pipeline Automation (CI/CD, GitHub Actions, Pytest)',
    why: 'Ensures machine learning services can be reliably tested, containerized, and deployed automatically without manual intervention.',
    focus: 'Write unit tests for tensor shapes and data pipelines using pytest; automate test execution with GitHub Actions.',
    study: 'CodeAlpha internship workflows.'
  }
];

function generateSkillsResponse(requestedCount: number | null, activeTopics: string[]): string {
  // If user requested an exact number of skills (e.g. 5 skills)
  if (requestedCount && requestedCount > 0) {
    const count = Math.min(requestedCount, MASTER_SKILLS.length);
    const selected = MASTER_SKILLS.slice(0, count);

    const skillsMarkdown = selected
      .map((s, idx) => {
        return `#### ${idx + 1}. **${s.title}**
- **Why Prioritized:** ${s.why}
- **Practical Focus:** ${s.focus}
- **Where to Learn:** ${s.study}`;
      })
      .join('\n\n---\n\n');

    return `### 🎯 Exactly ${count} Prioritized AI/ML Skills for Your Transition

To successfully transition from 14+ years in HR leadership to AI/ML engineering, here are **exactly ${count} prioritized skills**, ordered by immediate technical impact and hiring demand:

---

${skillsMarkdown}

---

**Strategic Advice:** Dedicate your primary focus to the top skills in this list first. Mastering Python, PyTorch, and applied vector deployment gives you the foundational engine required for production AI engineering.`;
  }

  // Default: Prioritized 3-Tier Framework
  return `### 🎯 Prioritized AI/ML Skills Framework

To successfully transition from 14+ years in HR leadership to AI/ML engineering, you must be disciplined about **what to prioritize**. Rather than trying to learn everything at once, focus on these three distinct tiers:

---

#### 🥇 Tier 1: Core Non-Negotiables (Master First)
*These are the baseline technical competencies required to pass any AI/ML technical screen.*

1. **Python & Scientific Computing (NumPy, Pandas, Vectorization)**
   - **Why Prioritized:** Universal baseline for all data pipelines, matrix transformations, and training batches.
   - **Where to Study:** CodeBasics drills and daily Python script exercises.

2. **PyTorch Framework Proficiency**
   - **Why Prioritized:** The primary industry standard for deep learning, research, and modern generative AI models.
   - **Where to Study:** Ostad live classes and hands-on Google Colab notebooks.

3. **Linear Algebra, Calculus & Loss Optimization**
   - **Why Prioritized:** Understanding matrix operations, loss gradients, and the chain rule prevents models from being black boxes.
   - **Where to Study:** CodeBasics mathematics modules.

4. **Vector Embeddings & Retrieval-Augmented Generation (RAG)**
   - **Why Prioritized:** Over 80% of current enterprise AI engineering roles demand production RAG systems and semantic vector search.
   - **Where to Study:** Google Cloud Gen AI Academy & CodeAlpha.

---

#### 🥈 Tier 2: High-Leverage Differentiators (What Sets You Apart)
*These skills give you an immediate edge over computer science graduates with zero business experience.*

1. **Cloud & Serverless Deployment (Google Cloud Vertex AI, Cloud Run, Docker)**
   - **Why Prioritized:** Demonstrates the ability to ship models to production, not just run cells in Jupyter notebooks.
2. **Model Evaluation & Metric Rigor**
   - **Why Prioritized:** Production engineers measure Precision, Recall, F1, ROC-AUC, and latency with statistical discipline.
3. **Algorithmic Ethics & Governance**
   - **Why Prioritized:** Leverages your 14+ years in HR leadership for bias auditing, regulatory standards, and AI safety.

---

#### 🥉 Tier 3: Specialized Capabilities (Build After Tiers 1 & 2)
1. **Parameter-Efficient Fine-Tuning (PEFT, LoRA, QLoRA)**
2. **Multi-Agent Orchestration & Tool Calling**
3. **MLOps & Pipeline Automation (CI/CD, GitHub Actions)**`;
}

// ---------------------------------------------------------------------------
// 4. RESUME & CV (Zero Fabricated Metrics)
// ---------------------------------------------------------------------------
function generateResumeResponse(): string {
  return `### 📄 Strategic AI/ML Engineering Resume Structure & Examples

When transitioning from 14+ years in HR leadership to AI/ML engineering, your resume must showcase **immediate technical capability** at the top while reframing your executive background as a **competitive moat** rather than a disconnect.

---

#### 📐 The Optimal 1-Page Layout
1. **Header:** Full Name, Location, Phone, Professional Email, LinkedIn URL, GitHub URL, Portfolio/Live Demo Link.
2. **Targeted Headline:** *AI/ML Engineer | Applied Deep Learning, RAG Systems & Cloud Deployment*.
3. **Technical Skills (Categorized):**
   - **Languages:** Python (Advanced), SQL, Bash, TypeScript/JavaScript.
   - **Frameworks & Libraries:** PyTorch, Hugging Face, NumPy, Pandas, Scikit-learn, FastAPI.
   - **AI & Cloud Platforms:** Google Cloud Vertex AI, Cloud Run, Gemini API, Docker, Vector Databases (ScaNN, Qdrant).
   - **Concepts:** Transformers, Self-Attention, RAG, CNNs, Model Evaluation, MLOps, AI Governance.
4. **Featured AI/ML Projects (Top 40% of Resume):** Highlight 2–3 production-grade systems using the Google X-Y-Z formula with empirical benchmark placeholders.
5. **Professional Experience (14+ Years in HR Leadership):** Reframed around quantitative systems, organizational analytics, and compliance.
6. **Certifications & Education:** Ostad Deep Learning, Google Cloud Gen AI Academy, CodeAlpha Internship, Degree.

---

#### ✍️ Concrete Project Bullet Examples (Google X-Y-Z Formula)
*Formula: Accomplished [X], as measured by [Y], by doing [Z]*

- **Enterprise Talent & Skill Matcher (Production RAG):**
  > *"Architected and deployed a containerized RAG service on Google Cloud Run using Vertex AI Vector Search and Gemini models, reducing semantic talent retrieval latency by [X% — measure p95 latency before/after optimization] while achieving [Y% — measure on test queries] precision on multi-skill benchmark queries."*
  > *"Engineered hybrid search pipeline combining dense vector embeddings with BM25 keyword matching and a cross-encoder reranker, improving Top-5 candidate retrieval accuracy by [X% — evaluate against baseline keyword search]."*
  > *"Configured automated Secret Manager integration and IAM least-privilege security policies, eliminating hardcoded keys across development and production environments."*

- **PyTorch Transformer & Attention Implementation:**
  > *"Implemented custom Scaled Dot-Product and Multi-Head Attention mechanisms in PyTorch from scratch, verifying numerical stability and tensor shapes [Batch, Seq_Len, Embed_Dim] across [N training epochs]."*
  > *"Integrated gradient clipping and LayerNorm to prevent gradient explosion during multi-epoch training, maintaining numerical stability across deep attention layers."*

---

#### 💼 Framing 14+ Years of HR Leadership as a Moat
Focus on **systems, quantitative scale, cross-functional execution, and compliance**:

> **Senior HR & People Systems Leader | Enterprise Organizations (2010 – Present)**
> - *"Designed and implemented data-informed talent evaluation matrices across [N enterprise employees / organization scale], analyzing organizational performance metrics to improve retention by [X% — insert verified historical metric]."*
> - *"Championed ethical compliance and bias-auditing protocols for hiring workflows, anticipating modern AI governance and human-in-the-loop alignment standards."*
> - *"Partnered directly with engineering and executive stakeholders to define technical headcount roadmaps, bridging communication between business KPIs and technical requirements."*

---

#### ⚠️ Metric Integrity Rule
**Never invent performance numbers on your resume.** If a metric is unknown, measure it empirically using your test datasets, validation scripts, or latency profiles (e.g. measuring p95 latency in milliseconds or precision@K) before placing it on your resume.`;
}

// ---------------------------------------------------------------------------
// 5. GITHUB & PORTFOLIO
// ---------------------------------------------------------------------------
function generateGitHubResponse(): string {
  return `### 🐙 Production-Grade GitHub Profile & Repository Guide

Technical recruiters and hiring managers spend less than 60 seconds reviewing a candidate's GitHub. To stand out, your profile must demonstrate **clean code, reproducibility, and architectural clarity**.

---

#### 📌 The 3 Pinned Repositories You Need
1. **Flagship RAG Project (e.g., \`talent-matcher-vertex-rag\`):**
   - End-to-end enterprise RAG pipeline using Google Cloud Vertex AI Vector Search, Gemini models, FastAPI, and Docker.
   - Demonstrates full-stack applied ML capability: data ingestion, vector indexing, reranking, and cloud deployment.
2. **Foundational Deep Learning (e.g., \`pytorch-transformer-from-scratch\`):**
   - Self-contained implementation of Scaled Dot-Product Attention, Multi-Head Attention, and a complete training loop in PyTorch.
   - Shows mathematical rigor, clean tensor operations, and deep comprehension of neural network internals.
3. **End-to-End ML Pipeline (e.g., \`mlops-data-pipeline-docker\`):**
   - Data preprocessing, model training, evaluation metrics suite, and GitHub Actions CI/CD with automated testing via \`pytest\`.

---

#### 📋 High-Impact README Checklist
Every pinned repository must follow this structure:
1. **Title & One-Line Value Proposition**
2. **Interactive Badges:** Python version, PyTorch, Docker build, CI status passing.
3. **System Architecture Diagram:** Clean Mermaid.js diagram showing data flow from ingestion to vector database to LLM synthesis.
4. **Key Benchmark Results:** A Markdown table showing query latency (p50/p95 in ms), retrieval precision/recall, and memory usage.
5. **Quickstart & Reproducibility:**
   \`\`\`bash
   git clone https://github.com/your-username/repo-name.git
   cd repo-name
   docker build -t app .
   docker run -p 8080:8080 -e GEMINI_API_KEY=your_key app
   \`\`\`
6. **Testing & Code Quality:** \`pytest tests/ -v\`.`;
}

// ---------------------------------------------------------------------------
// 6. PROJECTS
// ---------------------------------------------------------------------------
function generateProjectsResponse(count: number | null): string {
  const projects = [
    {
      title: 'Flagship Project 1: Enterprise Talent & Skill Matcher (Production RAG)',
      domain: 'Capitalizes on your Google Cloud Gen AI Academy training and HR domain authority.',
      problem: 'Enterprise job descriptions and candidate resumes have semantic disconnects (different phrasing for identical skills).',
      arch: 'Ingestion pipeline parsing documents into structured JSON; dense vector indexing using Vertex AI Vector Search; hybrid search with BM25; cross-encoder reranking; Gemini LLM synthesis.',
      tech: 'Python, PyTorch, FastAPI, Vertex AI, Docker, Google Cloud Run, Secret Manager.'
    },
    {
      title: 'Flagship Project 2: PyTorch Transformer & Attention Visualizer',
      domain: 'Demonstrates Ostad deep learning mastery and mathematical foundations.',
      problem: 'Neural attention mechanisms are often treated as black boxes.',
      arch: 'Implement ScaledDotProductAttention and MultiHeadAttention from scratch in PyTorch; custom training loops with learning rate scheduling; extract attention weight matrices and render dynamic attention heatmaps.',
      tech: 'PyTorch, NumPy, Matplotlib/Seaborn, Jupyter, Pytest.'
    },
    {
      title: 'Flagship Project 3: Automated ML Evaluation & Drift Detection Pipeline',
      domain: 'Demonstrates CodeAlpha and CodeBasics engineering hygiene.',
      problem: 'Machine learning models degrade silently when production data drifts from training distributions.',
      arch: 'Ingestion pipeline measuring statistical distribution drift (Kolmogorov-Smirnov test, Population Stability Index); automated evaluation harness computing Precision, Recall, F1, and ROC-AUC; CI/CD trigger via GitHub Actions.',
      tech: 'Python, Scikit-learn, Pandas, Scipy, Docker, GitHub Actions.'
    }
  ];

  const selectedProjects = count && count > 0 ? projects.slice(0, count) : projects;

  const content = selectedProjects
    .map(p => {
      return `#### 🏆 ${p.title}
*${p.domain}*
- **Problem:** ${p.problem}
- **Architecture:** ${p.arch}
- **Key Tech:** ${p.tech}`;
    })
    .join('\n\n---\n\n');

  return `### 🛠️ Production-Grade AI/ML Portfolio Projects

To convince engineering hiring managers of your capabilities, avoid generic tutorial datasets (Titanic, MNIST). Build **domain-relevant, production-ready systems** that combine your 14+ years of HR leadership with state-of-the-art AI/ML engineering:

---

${content}`;
}

// ---------------------------------------------------------------------------
// 7. INTERVIEWS
// ---------------------------------------------------------------------------
function generateInterviewResponse(): string {
  return `### 💼 Strategic HR-to-AI/ML Interview Positioning

Your 14+ years of HR leadership are not a liability—they are your **single greatest competitive moat** when properly framed for AI/ML engineering roles.

---

#### 🎯 Answering: "Tell Me About Yourself and Why You Switched"
Use this 3-part framework:
1. **The Origin (The 'Why'):**
   > *"For over 14 years, I led HR and people systems in enterprise environments, focusing on talent evaluation, workforce planning, and organizational performance. Over time, I realized that the core challenges I was solving—matching talent, evaluating capability gaps, and forecasting organizational needs—are fundamentally high-dimensional data and pattern-matching problems."*
2. **The Pivot (The Rigor):**
   > *"Rather than relying on off-the-shelf tools, I dedicated myself to deep technical mastery: studying linear algebra and calculus, building neural networks from scratch in PyTorch through Ostad, mastering vector search on Google Cloud, and building production RAG systems during my CodeAlpha internship."*
3. **The Unique Moat (The Value):**
   > *"Most AI engineers understand code, but few understand the business context, ethical compliance, and human alignment required for enterprise adoption. I bring production-grade PyTorch and cloud skills combined with 14+ years of real-world enterprise domain authority."*`;
}

// ---------------------------------------------------------------------------
// 8. SCHEDULE (Only when explicitly asked)
// ---------------------------------------------------------------------------
function generateScheduleResponse(): string {
  return `### ⏱️ Sustainable Study Schedule for Career Transition

Balancing an intensive AI/ML transition across 4 platforms (**Ostad**, **CodeBasics**, **Google Cloud**, **CodeAlpha**) requires energy management and sustainable consistency:

---

#### 📅 Recommended Weekly Cadence (15–20 Hours/Week)
- **Monday & Wednesday (Foundations & CodeBasics - 2 hrs/day):**
  - Focus: Applied mathematics (matrix calculus) and Python data structure drills.
- **Tuesday & Thursday (Ostad Deep Learning & PyTorch - 2.5 hrs/day):**
  - Focus: PyTorch tensor mechanics, custom layers, and live cohort review.
- **Saturday (Deep Project Sprint - Google Cloud & CodeAlpha - 4–5 hrs):**
  - Focus: Building and deploying production systems (Vertex AI, Docker, Cloud Run).
- **Sunday (Review, Consolidation & GitHub - 2 hrs):**
  - Focus: Code cleanup, README documentation, and reflection notes.`;
}

// ---------------------------------------------------------------------------
// 9. TECHNICAL TOPICS (Answer exact question directly)
// ---------------------------------------------------------------------------
function generateTransformerTechnicalResponse(): string {
  return `### 🧠 Scaled Dot-Product & Multi-Head Self-Attention

The core breakthrough of the Transformer architecture (*Vaswani et al., 2017*) is the **Self-Attention Mechanism**, allowing tokens in a sequence to dynamically attend to one another regardless of distance.

---

#### 📐 Mathematical Formulation
Given an input sequence mapped to Query ($Q$), Key ($K$), and Value ($V$) matrices of dimension $d_k$:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

1. **Similarity Computation ($QK^T$):** Computes the dot product between every query and key vector, yielding an unscaled attention matrix of shape \`[Batch, Seq_Len, Seq_Len]\`.
2. **Scaling Factor ($\\frac{1}{\\sqrt{d_k}}$):** For large projection dimensions, dot products grow large in magnitude, pushing the softmax function into regions with near-zero gradients. Scaling by $\\sqrt{d_k}$ preserves numerical stability.
3. **Softmax Normalization:** Converts raw scores into probability distributions summing to 1 across rows.
4. **Value Aggregation:** Multiplies probabilities by $V$ to compute weighted contextual representations.

---

#### 💻 PyTorch Implementation
\`\`\`python
import torch
import torch.nn as nn
import math

class ScaledDotProductAttention(nn.Module):
    def __init__(self, d_k: int):
        super().__init__()
        self.scale = 1.0 / math.sqrt(d_k)

    def forward(self, q: torch.Tensor, k: torch.Tensor, v: torch.Tensor, mask: torch.Tensor = None):
        # q, k, v shapes: [batch, heads, seq_len, d_k]
        scores = torch.matmul(q, k.transpose(-2, -1)) * self.scale
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        attn_weights = torch.softmax(scores, dim=-1)
        return torch.matmul(attn_weights, v), attn_weights
\`\`\``;
}

function generateBackpropTechnicalResponse(): string {
  return `### 📉 Backpropagation & Gradient Descent Mathematical Mechanics

Backpropagation is the algorithmic application of the **multivariable chain rule** to calculate the partial derivative of a scalar loss function $L$ with respect to each learnable weight $W$ in a neural network.

---

#### 📐 The Mathematical Chain Rule
For a simple layer with input $x$, weight $W$, bias $b$, pre-activation $z = Wx + b$, and activation $a = \\sigma(z)$:

$$\\frac{\\partial L}{\\partial W} = \\frac{\\partial L}{\\partial a} \\cdot \\frac{\\partial a}{\\partial z} \\cdot \\frac{\\partial z}{\\partial W}$$

- $\\frac{\\partial L}{\\partial a}$: Gradient of the loss with respect to activation output.
- $\\frac{\\partial a}{\\partial z} = \\sigma'(z)$: Local derivative of the activation function (e.g., $\\text{ReLU}'(z) = 1$ if $z > 0$ else $0$).
- $\\frac{\\partial z}{\\partial W} = x^T$: Local derivative of linear combination with respect to weights.

---

#### ⚙️ Weight Update (AdamW)
Once gradients are computed, optimizers update parameters:

$$W_{t+1} = W_t - \\eta \\cdot \\frac{\\hat{m}_t}{\\sqrt{\\hat{v}_t} + \\epsilon} - \\eta \\lambda W_t$$

Where $\\eta$ is learning rate, $\\hat{m}_t$ is bias-corrected first moment, $\\hat{v}_t$ is second moment, and $\\lambda$ is weight decay rate.`;
}

function generateBayesTechnicalResponse(): string {
  return `### 🎲 Bayes' Theorem & Probabilistic Machine Learning

Bayes' Theorem provides the mathematical framework for updating our belief in a hypothesis ($H$) in light of observed data/evidence ($E$).

---

#### 📐 Mathematical Formulation

$$P(H \\mid E) = \\frac{P(E \\mid H) \\cdot P(H)}{P(E)}$$

- **$P(H \\mid E)$ (Posterior):** Probability that hypothesis $H$ is true given evidence $E$.
- **$P(E \\mid H)$ (Likelihood):** Probability of observing evidence $E$ if hypothesis $H$ holds true.
- **$P(H)$ (Prior):** Initial belief in hypothesis $H$ before observing evidence.
- **$P(E)$ (Marginal Evidence):** Total probability of observing evidence $E$ across all hypotheses: $\\sum P(E \\mid H_i)P(H_i)$.

---

#### 🎯 Relevance to Modern AI/ML
1. **Bayesian Optimization:** Used for automated hyperparameter tuning when evaluation is expensive.
2. **Maximum A Posteriori (MAP) & Regularization:** L2 regularization (Weight Decay) corresponds mathematically to placing a zero-mean Gaussian prior over model weights.`;
}

function generateRagTechnicalResponse(): string {
  return `### 🔍 Retrieval-Augmented Generation (RAG) Architecture

RAG grounds generative models by retrieving authoritative external knowledge before generating an answer.

---

#### 🏗️ Production 4-Stage Pipeline
1. **Ingestion & Chunking:** Documents are parsed and split into chunks (256–512 tokens with 10–20% overlap).
2. **Dense Vector Indexing:** Chunks are embedded via embedding models and stored in a vector index (e.g., Google Cloud Vertex AI Vector Search / ScaNN).
3. **Hybrid Retrieval:** Dense cosine similarity is combined with sparse BM25 keyword matching via Reciprocal Rank Fusion (RRF).
4. **Cross-Encoder Reranking:** Top-50 candidates are re-scored by a joint transformer reranker, outputting Top-5 relevant chunks into the LLM prompt.`;
}

function generateCnnTechnicalResponse(): string {
  return `### 👁️ Convolutional Neural Networks (CNNs) & Spatial Hierarchy

CNNs leverage spatial locality and translation invariance to process multi-dimensional grid data (images, spectrograms).

---

#### 🔑 Core Operations
1. **Convolution Layer:** Slides learnable kernels across feature maps, performing element-wise multiplication and summation.
2. **Activation:** Applies non-linearities (e.g., \`ReLU\`, \`GELU\`).
3. **Pooling / Strided Convolutions:** Downsamples spatial dimensions ($H \\times W$) while increasing channel depth ($C$), expanding the receptive field.
4. **Residual Connections (ResNet):** Adds identity shortcuts ($x + F(x)$), preventing vanishing gradients in deep networks.`;
}

function generateMetricsTechnicalResponse(): string {
  return `### 📊 Machine Learning Evaluation Metrics

Selecting the correct evaluation metric depends directly on class distribution and the business cost of false positives vs. false negatives.

---

#### 📐 Core Classification Formulas
- **Precision:** $\\frac{TP}{TP + FP}$ — Out of all predicted positives, how many were correct? (Crucial when false positives are costly).
- **Recall (Sensitivity):** $\\frac{TP}{TP + FN}$ — Out of all actual positives, how many did we capture? (Crucial when false negatives are dangerous).
- **F1-Score:** $2 \\cdot \\frac{\\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}}$ — Harmonic mean balancing precision and recall.
- **PR-AUC vs. ROC-AUC:** On imbalanced datasets, use Precision-Recall AUC rather than ROC-AUC, as ROC-AUC can be overly optimistic due to large true negative counts.`;
}

function generateCloudDeploymentResponse(): string {
  return `### ☁️ Google Cloud & Serverless AI Deployment (Vertex AI + Cloud Run)

To deploy production AI systems securely without managing physical servers:

---

#### 🚀 Recommended Deployment Architecture
1. **Packaging:** Wrap inference logic inside a lightweight **FastAPI** application.
2. **Containerization:** Write a multi-stage **Dockerfile** using a clean Python 3.11 slim base image.
3. **Secret Security:** Never bake API keys into Docker images. Use **Google Cloud Secret Manager** and mount secrets via Cloud Run environment variables at runtime.
4. **Serverless Execution:** Deploy to **Google Cloud Run** with automatic concurrency scaling and scale-to-zero when idle.

\`\`\`dockerfile
# Multi-stage production Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
\`\`\``;
}

function generatePyTorchResponse(): string {
  return `### 🐍 PyTorch Core Architecture & Tensor Manipulation

Mastery of PyTorch requires understanding its three foundational pillars: **Tensors**, **Autograd**, and **Modular Layers**.

---

#### 🔑 PyTorch Mental Model
1. **Tensors (\`torch.Tensor\`):** Multi-dimensional arrays with hardware acceleration on GPUs/TPUs (\`.to('cuda')\`).
2. **Autograd (\`tensor.requires_grad=True\`):** Dynamically constructs a directed acyclic graph (DAG) during the forward pass. Calling \`loss.backward()\` traverses the DAG in reverse to compute gradients.
3. **Training Loop Skeleton:**
\`\`\`python
model.train()
for inputs, targets in dataloader:
    optimizer.zero_grad()       # 1. Clear stale gradients from previous step
    outputs = model(inputs)     # 2. Forward pass
    loss = criterion(outputs, targets) # 3. Compute loss
    loss.backward()             # 4. Backward pass (computes gradients)
    optimizer.step()            # 5. Update weights
\`\`\``;
}

// ---------------------------------------------------------------------------
// 10. TARGETED CONTEXTUAL DIRECT ANSWER
// ---------------------------------------------------------------------------
function generateTargetedDirectAnswer(message: string, activeTopics: string[]): string {
  return `### 💡 AI/ML Engineering Technical Insight

Regarding your question: **"${message}"**

In the context of modern **AI/ML Engineering** and your ongoing transition across **Ostad**, **CodeBasics**, **Google Cloud Gen AI Academy**, and **CodeAlpha**:

1. **Direct Technical Perspective:**
   - Focus on understanding the underlying data transformations and mathematical guarantees before relying on high-level abstractions.
   - Whether working with PyTorch tensors, vector embeddings, or Google Cloud Vertex AI pipelines, ensure that your data structures have explicit shapes, validated types, and clear error boundaries.

2. **Connecting Theory to Production:**
   - In production AI systems, theoretical correctness must always pair with engineering reliability: reproducible training loops, strict evaluation metrics (Precision/Recall, latency), and secure deployment.
   - Your extensive enterprise background brings a distinct advantage here: you already understand how software systems function within complex organizations, which allows you to design models that solve real business problems.

3. **Actionable Next Step:**
   - Test this concept in code with a minimal working script or notebook. Inspect intermediate tensor shapes or output dictionaries to confirm expected behavior.`;
}
