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
        content: `
Character Persona:
${characterPrompt}

Context:
You are roleplaying a character in a Mandarin learning game.
User's Name: ${userName}
OBJECTIVE: "${objective}"

Instructions:
1. Speak primarily in Mandarin Chinese (Simplified).
2. If the user is struggling, you can use simple words, but stay in character.
3. Pay close attention to the "Conversation History".
4. If the user has already ordered/answered your question, acknowledge it and move on.
5. Do not repeat initial greetings if the conversation is ongoing.
6. YOU are also the Game Master. Analyze the conversation and determine if the USER has achieved the OBJECTIVE.
7. Fail the user if they get off track or struggle to communicate.

IMPORTANT: You must return your response in a strict JSON format:
{
  "content": "The Mandarin response (Hanzi)",
  "translation": "The English translation",
  "status": "ACTIVE" | "COMPLETED" | "FAILED"
}

Status Rules:
- "COMPLETED": Goal achieved (e.g., reached destination, bought item).
- "FAILED": Explicit failure (e.g., insulted character, gave up, got off track).
- "ACTIVE": Conversation is ongoing.
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

    console.log(`[Game Master] Objective: "${objective}"`);
    console.log(`[Game Master] Verdict: ${result.status}`);

    return {
        content: result.content || "...",
        translation: result.translation || "",
        status: result.status || 'ACTIVE'
    };
}

