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
    userName: string = "Traveler"
): Promise<{ content: string; translation: string; status: 'ACTIVE' | 'COMPLETED' | 'FAILED' }> {
    const systemMessage: ChatMessage = {
        role: 'system',
        content: `Roleplay: ${characterPrompt}
User: ${userName}
Goal: ${objective}
Rules:
1. Speak Mandarin (Simplified).
2. GM Mode: Evaluate if Goal is achieved.
3. FAIL if off-track/insulting.
Return JSON:
{
  "content": "Mandarin response",
  "translation": "English",
  "status": "ACTIVE" | "COMPLETED" | "FAILED"
}`.trim()
    };

    const messages = [systemMessage, ...history];
    console.log("--- AI PROMPT DEBUG ---");
    console.log(JSON.stringify(messages, null, 2));
    console.log("-----------------------");

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.8,
        response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');

    console.log(`[Game Master] Objective: "${objective}"`);
    console.log(`[Game Master] Verdict: ${result.status}`);

    return {
        content: result.content || "...",
        translation: result.translation || "",
        status: result.status || 'ACTIVE'
    };
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
                content: `You are a Mandarin Coach. Analyze the conversation.
Scenario: "${scenarioTitle}", Goal: "${objective}"
Return JSON:
{
  "score": (0-100),
  "feedback": "2-3 sentence summary",
  "corrections": [
    {
      "category": "Grammar" | "Word Choice" | "Spelling" | "Other",
      "original": "User Hanzi",
      "correction": "Target Hanzi",
      "pinyin": "Pinyin",
      "translation": "English",
      "explanation": "Briefly why"
    }
  ],
  "suggestedFlashcards": [
    { "hanzi": "chars", "pinyin": "tones", "meaning": "English", "explanation": "Context" }
  ]
}`.trim()
            },
            ...history
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
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
        });

        return response.choices[0]?.message?.content?.trim() || pinyin;
    } catch (error) {
        console.error("AI Pinyin to Hanzi conversion failed:", error);
        return pinyin;
    }
}


