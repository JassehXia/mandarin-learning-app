import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export async function chatWithCharacter(
    history: ChatMessage[],
    characterPrompt: string,
    objective: string,
    summary?: string,
    userName: string = "Traveler"
): Promise<{ content: string; translation: string; status: 'ACTIVE' | 'COMPLETED' | 'FAILED' }> {
    const systemMessage: ChatMessage = {
        role: 'system',
        content: `Roleplay: ${characterPrompt}
User: ${userName}. Goal: ${objective}
${summary ? `Past Context: ${summary}` : ''}
Rules: 1. Speak Mandarin. 2. Evaluate if Goal achieved. 3. FAIL if off-track.
JSON Output: {"content": "Mandarin", "translation": "English", "status": "ACTIVE"|"COMPLETED"|"FAILED"}`.trim()
    };

    const messages = [systemMessage, ...history];
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.8,
        max_tokens: 300,
        response_format: { type: "json_object" },
    });

    const rawContent = response.choices[0]?.message?.content?.trim() || '{}';
    let result;
    try {
        result = JSON.parse(rawContent);
    } catch (e) {
        console.error("AI Parse Error:", rawContent);
        result = { content: "抱歉，请稍后再试。", translation: "Sorry, try again later.", status: "ACTIVE" };
    }

    return {
        content: result.content || "...",
        translation: result.translation || "",
        status: (result.status as 'ACTIVE' | 'COMPLETED' | 'FAILED') || 'ACTIVE'
    };
}

export async function summarizeHistory(history: ChatMessage[]): Promise<string> {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: 'Summarize this Mandarin conversation concisely. Focus on: 1. User progress toward goal. 2. Key vocab used. 3. Current emotional state. Keep it under 100 words in English.'
            },
            ...history
        ],
        temperature: 0.3,
        max_tokens: 200,
    });

    return response.choices[0]?.message?.content?.trim() || "Previous conversation started.";
}

export async function generateFeedback(
    history: ChatMessage[],
    scenarioTitle: string,
    objective: string
): Promise<{
    score: number;
    feedback: string;
    corrections: { category: string; original: string; correction: string; pinyin: string; translation: string; explanation: string }[];
    suggestedFlashcards: { hanzi: string; pinyin: string; meaning: string; explanation: string }[];
}> {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: `Mandarin Coach. Analyze: Scenario: "${scenarioTitle}", Goal: "${objective}"
JSON Output: {
  "score": (0-100),
  "feedback": "2-3 sentences",
  "corrections": [{ "category": "Grammar"|"Word Choice"|"Other", "original": "text", "correction": "text", "pinyin": "tones", "translation": "English", "explanation": "why" }],
  "suggestedFlashcards": [{ "hanzi": "chars", "pinyin": "tones", "meaning": "English", "explanation": "context" }]
}`.trim()
            },
            ...history
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    return {
        score: result.score || 0,
        feedback: result.feedback || "Great attempt! Keep practicing.",
        corrections: result.corrections || [],
        suggestedFlashcards: result.suggestedFlashcards || []
    };
}

/**
 * Converts a pinyin string into the most likely Chinese characters (Hanzi).
 * Useful for providing natural-sounding audio feedback for user inputs.
 */
export async function getHanziFromPinyin(pinyin: string): Promise<string> {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a pinyin-to-hanzi converter. Convert the provided pinyin into the most statistically likely Chinese characters (Simplified). Return ONLY the Hanzi characters, no other text or explanation.'
                },
                {
                    role: 'user',
                    content: pinyin
                }
            ],
            temperature: 0.3, // Lower temperature for more deterministic conversion
            max_tokens: 100,
        });

        return response.choices[0]?.message?.content?.trim() || pinyin;
    } catch (error) {
        console.error("AI Pinyin to Hanzi conversion failed:", error);
        return pinyin;
    }
}


