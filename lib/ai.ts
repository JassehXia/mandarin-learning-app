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
Rules: 1. Speak Mandarin. 2. Be concise (2-3 sentences max). 3. Stay in character. 4. Evaluate Goal: set 'COMPLETED' ONLY if ALL sub-tasks mentioned in the Goal are fully achieved. 5. FAIL if off-track.
Avoid generic responses like "...". If you're stuck, ask a relevant follow-up in character.
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

export async function* chatWithCharacterStream(
    history: ChatMessage[],
    characterPrompt: string,
    objective: string,
    summary?: string,
    userName: string = "Traveler"
) {
    const systemMessage: ChatMessage = {
        role: 'system',
        content: `Roleplay: ${characterPrompt}
User: ${userName}. Goal: ${objective}
${summary ? `Past Context: ${summary}` : ''}
Rules: 1. Speak Mandarin. 2. Be concise (2-3 sentences max). 3. Stay in character. 4. Evaluate Goal: set 'COMPLETED' ONLY if ALL sub-tasks or requirements in the Goal are fully addressed. 5. FAIL if off-track.
Avoid generic responses like "...". If you're stuck, ask a relevant follow-up in character.
Return a Mandarin response first, then after a delimiter "---METADATA---", return a JSON object with: 
{"translation": "English translation of YOUR Mandarin response above", "status": "ACTIVE"|"COMPLETED"|"FAILED"}`.trim()
    };

    const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [systemMessage, ...history],
        temperature: 0.8,
        max_tokens: 400,
        stream: true,
    });

    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) yield content;
    }
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



export async function translateSelection(text: string): Promise<{ pinyin: string; meaning: string }> {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Translate the following Chinese snippet to English. Return ONLY JSON in this format: {"pinyin": "...", "meaning": "..."}. Pinyin should use tone marks.'
                },
                {
                    role: 'user',
                    content: text
                }
            ],
            temperature: 0.3,
            max_tokens: 150,
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(response.choices[0]?.message?.content || '{}');
        return {
            pinyin: result.pinyin || "",
            meaning: result.meaning || ""
        };
    } catch (error) {
        console.error("AI Translation failed:", error);
        return { pinyin: "", meaning: "" };
    }
}

export async function generateHints(
    history: { role: 'user' | 'assistant', content: string }[],
    scenarioTitle: string,
    scenarioObjective: string
) {
    const prompt = `You are a helpful Mandarin tutor. The user is in a language learning scenario: "${scenarioTitle}". 
    The objective is: "${scenarioObjective}".
    
    Current Conversation History:
    ${history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}
    
    Based on the current state of the conversation, suggest 3 natural and helpful ways the user can respond to achieve their objective.
    For each suggestion, provide:
    1. hanzi (Chinese characters)
    2. pinyin (with tone marks)
    3. meaning (English translation)
    
    Return ONLY a JSON object in this format:
    {
        "hints": [
            { "hanzi": "...", "pinyin": "...", "meaning": "..." },
            { "hanzi": "...", "pinyin": "...", "meaning": "..." },
            { "hanzi": "...", "pinyin": "...", "meaning": "..." }
        ]
    }`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: prompt }],
        response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content || '{"hints": []}';
    return JSON.parse(content) as {
        hints: { hanzi: string; pinyin: string; meaning: string }[]
    };
}
