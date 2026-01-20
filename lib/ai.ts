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

export async function generateFeedback(
    history: ChatMessage[],
    scenarioTitle: string,
    objective: string
): Promise<{
    score: number;
    feedback: string;
    corrections: { original: string; correction: string; pinyin: string; translation: string; explanation: string }[];
    suggestedFlashcards: { hanzi: string; pinyin: string; meaning: string; explanation: string }[];
}> {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: `
You are a professional Mandarin Language Coach and Games Master.
Analyze the following conversation from a roleplay scenario.

Scenario: "${scenarioTitle}"
Objective: "${objective}"

Please evaluate the User's performance based on:
1. Goal Completion: Did they achieve the objective?
2. Language Proficiency: vocabulary usage, grammar, and naturalness.
3. Communication Effectiveness: Were they clear and polite?

IMPORTANT: Find any specific Mandarin phrases the user got wrong or could say more naturally.
Include them in the "corrections" array.

Also, suggest 3-5 high-value vocabulary words or short phrases from this conversation that the user should learn/review as flashcards.
Include them in the "suggestedFlashcards" array.

You must return your response in a strict JSON format:
{
  "score": (a number from 0 to 100),
  "feedback": "A concise paragraph (2-3 sentences) summarizing their overall performance.",
  "corrections": [
    {
      "original": "The user's original incorrect/awkward Mandarin",
      "correction": "The ideal/correct Mandarin",
      "pinyin": "Pinyin for the correction",
      "translation": "English translation for the correction",
      "explanation": "Briefly why this is better (in English)"
    }
  ],
  "suggestedFlashcards": [
    {
      "hanzi": "Mandarin characters",
      "pinyin": "Pinyin with tones",
      "meaning": "English meaning",
      "explanation": "Context or usage note"
    }
  ]
}
                `.trim()
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


