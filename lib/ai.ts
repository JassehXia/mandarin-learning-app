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
    userName: string = "Traveler"
): Promise<{ content: string; pinyin: string; translation: string }> {
    const systemMessage: ChatMessage = {
        role: 'system',
        content: `
Character Persona:
${characterPrompt}

Context:
You are roleplaying a character in a Mandarin learning game.
You should speak primarily in Mandarin Chinese (Simplified).
If the user is struggling, you can use simple words, but stay in character.
Do not break character.
User's Name: ${userName}

Instructions:
1. Pay close attention to the "Conversation History".
2. If the user has already ordered/answered your question, acknowledge it and move on.
3. do NOT repeat your initial greeting ("Welcome!") if the conversation has already started.
4. If the user confirms a choice (e.g., "Pork"), confirm it and ask for the next step (e.g., payment or sauce).
5. Do not keep asking the same question ("What filling?") if they just answered it.

IMPORTANT: You must return your response in a strict JSON format:
{
  "content": "The Mandarin response (Hanzi)",
  "pinyin": "The Pinyin with tone marks",
  "translation": "The English translation"
}
        `.trim()
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
    return {
        content: result.content || "...",
        pinyin: result.pinyin || "",
        translation: result.translation || "",
    };
}

export async function evaluateObjective(
    history: ChatMessage[],
    objective: string
): Promise<{ status: 'ACTIVE' | 'COMPLETED' | 'FAILED' }> {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: `
You are a Game Master refereeing a language learning game.
OBJECTIVE: "${objective}"

Your job is to analyze the Conversation History and determine if the USER has successfully achieved the OBJECTIVE.

Rules:
1. Return JSON format only: { "status": "ACTIVE" | "COMPLETED" | "FAILED" }
2. "COMPLETED" means the user explicitly achieved the goal (e.g., reached the destination, bought the item).
3. "FAILED" means the user explicitly failed (e.g., insulted the driver, got kicked out).
4. "ACTIVE" means the conversation is still ongoing.
5. Be lenient with grammar, strict with intent.
                `.trim()
            },
            ...history
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    console.log(`[Game Master] Objective: "${objective}"`);
    console.log(`[Game Master] Verdict: ${result.status}`);
    return {
        status: result.status || 'ACTIVE',
    };
}
