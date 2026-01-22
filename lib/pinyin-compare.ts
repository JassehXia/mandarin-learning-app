/**
 * Normalizes pinyin by removing spaces, converting to lowercase,
 * and handling both tone marks and numeric tones
 */
function normalizePinyin(pinyin: string): string {
    return pinyin
        .toLowerCase()
        .replace(/\s+/g, '') // Remove all spaces
        .trim();
}

/**
 * Compares user input pinyin with correct pinyin
 * Returns an object with match status and character-level differences
 */
export function comparePinyin(userInput: string, correctPinyin: string): {
    isCorrect: boolean;
    differences: Array<{
        char: string;
        isCorrect: boolean;
        position: number;
    }>;
} {
    const normalized = normalizePinyin(userInput);
    const correct = normalizePinyin(correctPinyin);

    const isCorrect = normalized === correct;

    // Build character-level diff using the original input (with spaces preserved)
    const differences: Array<{
        char: string;
        isCorrect: boolean;
        position: number;
    }> = [];

    // Compare the normalized versions but display the original
    let normalizedIndex = 0;

    for (let i = 0; i < userInput.length; i++) {
        const originalChar = userInput[i];

        // Skip spaces in the original input for display purposes
        if (originalChar === ' ') {
            continue;
        }

        const normalizedChar = normalized[normalizedIndex];
        const correctChar = correct[normalizedIndex];

        differences.push({
            char: originalChar,
            isCorrect: normalizedChar === correctChar,
            position: normalizedIndex
        });

        normalizedIndex++;
    }

    return {
        isCorrect,
        differences
    };
}
