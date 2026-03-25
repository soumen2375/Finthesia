// ============================================================================
// Hybrid PDF Parser — Local Ollama or Hosted API (Together.ai / Groq)
// Automatic provider detection, retry logic, India-specific categorization
// ============================================================================

import * as pdfjsLib from 'pdfjs-dist';

// Configure pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

// ── Types ────────────────────────────────────────────────────────────────────

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  merchant: string;
  party?: string;      // extracted from UPI descriptions
  upiId?: string;      // UPI ID if found
}

export type ProviderType = 'ollama' | 'together' | 'groq';

export interface ProviderStatus {
  provider: ProviderType;
  online: boolean;
  modelName: string;
  label: string;   // human-readable, e.g. "Ollama (local)" or "Together.ai"
}

// ── Config ───────────────────────────────────────────────────────────────────

const CONFIG = {
  // Ollama (local dev)
  ollamaUrl: '/ollama',                                      // proxied via vite
  ollamaModel: import.meta.env.VITE_OLLAMA_MODEL || 'qwen2.5:7b',

  // Hosted API (production — Together.ai or Groq)
  llmApiUrl: import.meta.env.VITE_LLM_API_URL || '',        // e.g. https://api.together.xyz/v1
  llmApiKey: import.meta.env.VITE_LLM_API_KEY || '',
  llmModel: import.meta.env.VITE_LLM_MODEL || 'Qwen/Qwen2.5-7B-Instruct-Turbo',

  // Retry
  maxRetries: 2,
  retryDelayMs: 1500,
};

// ── Provider Detection ───────────────────────────────────────────────────────

/**
 * Determine which provider to use:
 * - If VITE_LLM_API_URL + VITE_LLM_API_KEY are set → use hosted API
 * - Otherwise → try local Ollama
 */
export function detectProvider(): ProviderType {
  if (CONFIG.llmApiUrl && CONFIG.llmApiKey) {
    if (CONFIG.llmApiUrl.includes('groq')) return 'groq';
    return 'together';
  }
  return 'ollama';
}

/**
 * Check if the active provider is online and the model is available
 */
export async function checkProviderStatus(): Promise<ProviderStatus> {
  const provider = detectProvider();

  if (provider === 'ollama') {
    try {
      const res = await fetch(`${CONFIG.ollamaUrl}/api/tags`);
      if (!res.ok) return { provider, online: false, modelName: CONFIG.ollamaModel, label: 'Ollama (offline)' };

      const data = await res.json();
      const models: string[] = (data.models || []).map((m: any) => m.name);
      const hasModel = models.some(
        (m) => m === CONFIG.ollamaModel || m.startsWith(CONFIG.ollamaModel.split(':')[0])
      );

      return {
        provider,
        online: hasModel,
        modelName: CONFIG.ollamaModel,
        label: hasModel ? `Qwen2.5 (local)` : `Model missing`,
      };
    } catch {
      return { provider, online: false, modelName: CONFIG.ollamaModel, label: 'Ollama (offline)' };
    }
  }

  // Hosted API — Together.ai / Groq
  // We can't easily ping these without burning tokens, so assume online if key exists
  const label = provider === 'groq' ? 'Groq' : 'Together.ai';
  return {
    provider,
    online: !!CONFIG.llmApiKey,
    modelName: CONFIG.llmModel,
    label: `${label} (${CONFIG.llmModel.split('/').pop()})`,
  };
}

// ── India-Specific Categorization ────────────────────────────────────────────

const INDIA_MERCHANT_MAP: Record<string, { category: string; merchant: string }> = {
  // Food & drinks
  'swiggy': { category: 'Food & drinks', merchant: 'Swiggy' },
  'zomato': { category: 'Food & drinks', merchant: 'Zomato' },
  'dunzo': { category: 'Food & drinks', merchant: 'Dunzo' },
  'blinkit': { category: 'Food & drinks', merchant: 'Blinkit' },
  'zepto': { category: 'Food & drinks', merchant: 'Zepto' },
  'bigbasket': { category: 'Food & drinks', merchant: 'BigBasket' },
  'dominos': { category: 'Food & drinks', merchant: "Domino's" },
  'mcdonald': { category: 'Food & drinks', merchant: "McDonald's" },
  'starbucks': { category: 'Food & drinks', merchant: 'Starbucks' },
  'chaayos': { category: 'Food & drinks', merchant: 'Chaayos' },

  // Transport
  'uber': { category: 'Transport', merchant: 'Uber' },
  'ola': { category: 'Transport', merchant: 'Ola' },
  'rapido': { category: 'Transport', merchant: 'Rapido' },
  'irctc': { category: 'Transport', merchant: 'IRCTC' },
  'makemytrip': { category: 'Transport', merchant: 'MakeMyTrip' },
  'indigo': { category: 'Transport', merchant: 'IndiGo Airlines' },
  'redbus': { category: 'Transport', merchant: 'RedBus' },
  'indian railway': { category: 'Transport', merchant: 'Indian Railways' },
  'fastag': { category: 'Transport', merchant: 'FASTag Toll' },
  'metro': { category: 'Transport', merchant: 'Metro' },
  'petrol': { category: 'Transport', merchant: 'Fuel Station' },
  'diesel': { category: 'Transport', merchant: 'Fuel Station' },
  'bharat petroleum': { category: 'Transport', merchant: 'BPCL' },
  'indian oil': { category: 'Transport', merchant: 'Indian Oil' },
  'hp petrol': { category: 'Transport', merchant: 'HP Petrol' },

  // Shopping
  'amazon': { category: 'Shopping', merchant: 'Amazon' },
  'flipkart': { category: 'Shopping', merchant: 'Flipkart' },
  'myntra': { category: 'Shopping', merchant: 'Myntra' },
  'ajio': { category: 'Shopping', merchant: 'AJIO' },
  'meesho': { category: 'Shopping', merchant: 'Meesho' },
  'nykaa': { category: 'Shopping', merchant: 'Nykaa' },
  'croma': { category: 'Shopping', merchant: 'Croma' },
  'reliance': { category: 'Shopping', merchant: 'Reliance' },
  'dmart': { category: 'Shopping', merchant: 'DMart' },

  // Entertainment
  'netflix': { category: 'Entertainment', merchant: 'Netflix' },
  'spotify': { category: 'Entertainment', merchant: 'Spotify' },
  'hotstar': { category: 'Entertainment', merchant: 'Hotstar' },
  'disney': { category: 'Entertainment', merchant: 'Disney+ Hotstar' },
  'prime video': { category: 'Entertainment', merchant: 'Amazon Prime' },
  'youtube': { category: 'Entertainment', merchant: 'YouTube Premium' },
  'bookmyshow': { category: 'Entertainment', merchant: 'BookMyShow' },
  'pvr': { category: 'Entertainment', merchant: 'PVR Cinemas' },
  'inox': { category: 'Entertainment', merchant: 'INOX' },
  'jiocinema': { category: 'Entertainment', merchant: 'JioCinema' },
  'zee5': { category: 'Entertainment', merchant: 'ZEE5' },
  'sonyliv': { category: 'Entertainment', merchant: 'SonyLIV' },

  // Bills & utilities
  'jio': { category: 'Bills & utilities', merchant: 'Jio' },
  'airtel': { category: 'Bills & utilities', merchant: 'Airtel' },
  'vodafone': { category: 'Bills & utilities', merchant: 'Vi (Vodafone)' },
  'bsnl': { category: 'Bills & utilities', merchant: 'BSNL' },
  'electricity': { category: 'Bills & utilities', merchant: 'Electricity Bill' },
  'tata power': { category: 'Bills & utilities', merchant: 'Tata Power' },
  'adani': { category: 'Bills & utilities', merchant: 'Adani Electricity' },
  'gas bill': { category: 'Bills & utilities', merchant: 'Gas Bill' },
  'water bill': { category: 'Bills & utilities', merchant: 'Water Bill' },
  'broadband': { category: 'Bills & utilities', merchant: 'Broadband' },
  'act fibernet': { category: 'Bills & utilities', merchant: 'ACT Fibernet' },

  // Investment
  'zerodha': { category: 'Investment', merchant: 'Zerodha' },
  'groww': { category: 'Investment', merchant: 'Groww' },
  'upstox': { category: 'Investment', merchant: 'Upstox' },
  'coin': { category: 'Investment', merchant: 'Zerodha Coin' },
  'mutual fund': { category: 'Investment', merchant: 'Mutual Fund' },
  'sip': { category: 'Investment', merchant: 'SIP Investment' },
  'lic': { category: 'Investment', merchant: 'LIC' },
  'ppf': { category: 'Investment', merchant: 'PPF' },
  'nps': { category: 'Investment', merchant: 'NPS' },

  // Health
  'apollo': { category: 'Health', merchant: 'Apollo' },
  'pharmeasy': { category: 'Health', merchant: 'PharmEasy' },
  'netmeds': { category: 'Health', merchant: 'Netmeds' },
  'practo': { category: 'Health', merchant: 'Practo' },
  '1mg': { category: 'Health', merchant: '1mg' },
  'medplus': { category: 'Health', merchant: 'MedPlus' },

  // Education
  'unacademy': { category: 'Education', merchant: 'Unacademy' },
  'byju': { category: 'Education', merchant: "BYJU'S" },
  'udemy': { category: 'Education', merchant: 'Udemy' },
  'coursera': { category: 'Education', merchant: 'Coursera' },
};

const ALL_CATEGORIES = [
  'Food & drinks', 'Transport', 'Shopping', 'Bills & utilities',
  'Entertainment', 'Investment', 'Salary', 'Transfer',
  'Health', 'Education', 'Other',
];

/**
 * Try to match a description/merchant against India-specific rules
 */
function matchIndiaMerchant(text: string): { category: string; merchant: string } | null {
  const lower = text.toLowerCase();
  for (const [keyword, mapping] of Object.entries(INDIA_MERCHANT_MAP)) {
    if (lower.includes(keyword)) return mapping;
  }
  return null;
}

/**
 * Extract party name & UPI ID from UPI transaction descriptions
 * e.g. "UPI-RAHUL SHARMA-rahulsharma@okicici-..." → party: "Rahul Sharma", upiId: "rahulsharma@okicici"
 */
function extractUPIParty(description: string): { party?: string; upiId?: string } {
  // UPI format: UPI-NAME-UPI_ID-...
  const upiMatch = description.match(/UPI[-/]([^-/]+)[-/]([a-zA-Z0-9_.]+@[a-zA-Z]+)/i);
  if (upiMatch) {
    const rawName = upiMatch[1].trim();
    // Title-case the name
    const party = rawName
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    return { party, upiId: upiMatch[2] };
  }

  // NEFT/IMPS format: NEFT-XXXX-NAME or IMPS-XXXX-NAME
  const neftMatch = description.match(/(?:NEFT|IMPS)[-/]\w+[-/]([^-/]+)/i);
  if (neftMatch) {
    const rawName = neftMatch[1].trim();
    const party = rawName
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    return { party };
  }

  return {};
}

// ── PDF Text Extraction ──────────────────────────────────────────────────────

/**
 * Extract raw text from PDF using pdfjs-dist (runs in browser, no server needed)
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ');
    pages.push(pageText);
  }

  return pages.join('\n\n--- PAGE BREAK ---\n\n');
}

// ── LLM Calls (Hybrid) ──────────────────────────────────────────────────────

function buildSystemPrompt(statementType: 'bank' | 'credit_card'): string {
  return `You are a financial statement parser specializing in Indian bank statements. You will receive raw text extracted from a ${
    statementType === 'credit_card' ? 'credit card' : 'bank'
  } statement.

Extract ALL transactions and return ONLY a valid JSON array (no markdown, no explanation, no \`\`\` fences) with this exact structure:
[
  {
    "date": "YYYY-MM-DD",
    "description": "original description from statement",
    "merchant": "clean merchant name",
    "amount": 1234.56,
    "type": "debit" or "credit",
    "category": "one of: Food & drinks, Transport, Shopping, Bills & utilities, Entertainment, Investment, Salary, Transfer, Health, Education, Other"
  }
]

Rules:
- amount must be a positive number
- For credit cards: purchases/charges are "debit", payments/refunds/cashback are "credit"
- For bank accounts: incoming (salary/transfers in/interest) is "credit", outgoing is "debit"
- Convert ANY date format (DD/MM/YYYY, DD-MMM-YY, etc.) to YYYY-MM-DD
- Indian merchant categorization:
  Swiggy/Zomato/BigBasket/Blinkit/Zepto/Dunzo → Food & drinks
  Uber/Ola/Rapido/IRCTC/FASTag/petrol → Transport
  Amazon/Flipkart/Myntra/AJIO/Meesho → Shopping
  Netflix/Spotify/Hotstar/BookMyShow/PVR → Entertainment
  Jio/Airtel/Vi/electricity/broadband → Bills & utilities
  Zerodha/Groww/mutual fund/SIP/LIC → Investment
  UPI transfers/NEFT/IMPS between accounts → Transfer
  Salary/interest credited → Salary
  Apollo/PharmEasy/1mg → Health
  Unacademy/BYJU's/Udemy → Education
- Do NOT include opening/closing balance, statement summary, or fee entries
- For UPI transactions, extract the merchant/person name
- If unsure about category, use "Other"
- Return [] if no transactions found`;
}

/**
 * Call Ollama (local) with the given prompt
 */
async function callOllama(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(`${CONFIG.ollamaUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: CONFIG.ollamaModel,
      prompt: userPrompt,
      system: systemPrompt,
      stream: false,
      options: { temperature: 0.1, num_predict: 8192 },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Ollama error (${response.status}): ${errText || 'No response'}`);
  }

  const data = await response.json();
  return data.response || '';
}

/**
 * Call hosted API (Together.ai / Groq) — OpenAI-compatible /chat/completions
 */
async function callHostedAPI(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(`${CONFIG.llmApiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.llmApiKey}`,
    },
    body: JSON.stringify({
      model: CONFIG.llmModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 8192,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Generic LLM call that routes to the right provider
 */
async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const provider = detectProvider();

  if (provider === 'ollama') {
    return callOllama(systemPrompt, userPrompt);
  } else {
    return callHostedAPI(systemPrompt, userPrompt);
  }
}

// ── Retry Wrapper ────────────────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = CONFIG.maxRetries,
  delayMs: number = CONFIG.retryDelayMs,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      console.warn(`Attempt ${attempt + 1}/${maxRetries + 1} failed: ${err.message}`);

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}

// ── JSON Extraction ──────────────────────────────────────────────────────────

/**
 * Robustly extract JSON array from LLM response text
 * Handles markdown fences, leading text, trailing text, etc.
 */
function extractJSON(raw: string): any[] {
  // Strip markdown fences
  let cleaned = raw.replace(/```json?\n?/gi, '').replace(/```/g, '').trim();

  // Try direct parse first
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* fall through */ }

  // Try to find JSON array in the text
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* fall through */ }
  }

  // Try line-by-line cleanup (sometimes LLM adds comments)
  const lines = cleaned.split('\n').filter(
    (l) => !l.trim().startsWith('//') && !l.trim().startsWith('#')
  );
  try {
    const parsed = JSON.parse(lines.join('\n'));
    if (Array.isArray(parsed)) return parsed;
  } catch { /* fall through */ }

  throw new Error('AI response did not contain valid JSON. Please try again.');
}

// ── Main Pipeline ────────────────────────────────────────────────────────────

/**
 * Full pipeline: File → Text Extraction → AI Parsing → India Rules → Validated Transactions
 */
export async function parseStatement(
  file: File,
  statementType: 'bank' | 'credit_card',
): Promise<ParsedTransaction[]> {
  // Step 1: Extract text from PDF
  if (file.type !== 'application/pdf') {
    throw new Error('Only PDF files are supported. Please upload a text-based PDF statement.');
  }

  const text = await extractTextFromPDF(file);

  if (!text || text.trim().length < 50) {
    throw new Error(
      'Could not extract text from this PDF. It may be a scanned/image-based document. ' +
      'Try a digitally-generated statement from your bank\'s website or app.'
    );
  }

  // Step 2: Call AI with retry logic
  const systemPrompt = buildSystemPrompt(statementType);
  const userPrompt = `Here is the raw text extracted from a bank/credit card statement. Extract all transactions as a JSON array.\n\n---\n${text}\n---\n\nReturn ONLY the JSON array, nothing else.`;

  const rawResponse = await withRetry(() => callLLM(systemPrompt, userPrompt));

  // Step 3: Parse JSON (with retry on invalid JSON)
  let rawTransactions: any[];
  try {
    rawTransactions = extractJSON(rawResponse);
  } catch {
    // Retry once with a "fix your JSON" prompt
    console.warn('First JSON parse failed, retrying with correction prompt...');
    const fixPrompt = `Your previous response was not valid JSON. Here it is:\n\n${rawResponse}\n\nFix it and return ONLY the valid JSON array of transactions. No explanation, no markdown.`;
    const fixedResponse = await callLLM(systemPrompt, fixPrompt);
    rawTransactions = extractJSON(fixedResponse);
  }

  if (!Array.isArray(rawTransactions) || rawTransactions.length === 0) {
    throw new Error('No transactions found. The statement may be in an unsupported format.');
  }

  // Step 4: Validate, enrich with India rules, extract UPI parties
  const validated: ParsedTransaction[] = rawTransactions
    .filter((t) => t.date && typeof t.amount === 'number' && t.amount > 0)
    .map((t) => {
      const desc = t.description || '';
      const merchantRaw = t.merchant || desc;

      // Try India-specific merchant matching first
      const indiaMatch = matchIndiaMerchant(desc) || matchIndiaMerchant(merchantRaw);

      // Extract UPI party info
      const upiInfo = extractUPIParty(desc);

      return {
        date: t.date,
        description: desc,
        merchant: indiaMatch?.merchant || merchantRaw || 'Unknown',
        amount: Math.abs(t.amount),
        type: (t.type === 'credit' ? 'credit' : 'debit') as 'debit' | 'credit',
        category: indiaMatch?.category ||
          (ALL_CATEGORIES.includes(t.category) ? t.category : 'Other'),
        party: upiInfo.party,
        upiId: upiInfo.upiId,
      };
    });

  if (validated.length === 0) {
    throw new Error('No valid transactions could be parsed from this statement.');
  }

  return validated;
}
