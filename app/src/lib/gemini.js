import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
if (apiKey && apiKey !== "YOUR_API_KEY") {
    genAI = new GoogleGenerativeAI(apiKey);
}

// ── Available models ──────────────────────────────────────────────────────────
export const AVAILABLE_MODELS = {
    "gemini-2.5-flash-lite": { label: "Gemini 2.5 Flash-Lite", description: "Fast & free — great default" },
    "gemini-2.5-flash": { label: "Gemini 2.5 Flash", description: "Smarter flash model (free tier)" }
};

const DEFAULT_MODEL = "gemini-2.5-flash-lite";
const STORAGE_KEY = "gemini_model";

// ── Model selection ───────────────────────────────────────────────────────────
export const getSelectedModel = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved && AVAILABLE_MODELS[saved]) ? saved : DEFAULT_MODEL;
};
export const setSelectedModel = (modelId) => localStorage.setItem(STORAGE_KEY, modelId);

// ── Internal fallback mock for local dev without API key ──────────────────────
const getMockModel = () => ({
    generateContent: async (prompt) => {
        await new Promise(r => setTimeout(r, 1000));
        const text = typeof prompt === 'string' ? prompt : prompt?.contents?.[0]?.parts?.[0]?.text || '';
        if (text.toLowerCase().includes("evaluate") || text.toLowerCase().includes("feedback")) {
            return { response: { text: () => JSON.stringify({ score: 7, strengths: ["Clear"], improvements: ["Metrics"], idealOutline: "STAR" }) } };
        }
        return { response: { text: () => "Example question: Describe a technical challenge you faced." } };
    }
});

// ── Core model factory ────────────────────────────────────────────────────────
const getModel = () => {
    if (!genAI) return getMockModel();
    return genAI.getGenerativeModel({ model: getSelectedModel() });
};

// Keep these exports so InterviewSessionPage doesn't break
export const getGeminiModel = () => getModel();
export const getGeminiFlashModel = () => getModel();

// ── High-level helpers ────────────────────────────────────────────────────────
export const generateText = async (prompt) => {
    const result = await getModel().generateContent(prompt);
    return result.response.text().trim();
};

export const generateJSON = async (prompt) => {
    const result = await getModel().generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
    });

    try {
        return JSON.parse(result.response.text());
    } catch (e) {
        console.error("AI response was not valid JSON:", result.response.text());
        throw new Error("AI failed to return a valid JSON object.");
    }
};

export const robustGenerateContent = async (prompt) => {
    const result = await getModel().generateContent(prompt);
    return result.response.text();
};


