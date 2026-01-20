/**
 * Converts numeric pinyin (e.g., "ni3 hao3") to accented tone marks ("nǐ hǎo").
 */
export function convertToToneMarks(text: string): string {
    if (!text) return text;

    const toneMap: Record<string, string[]> = {
        a: ['a', 'ā', 'á', 'ǎ', 'à', 'a'],
        e: ['e', 'ē', 'é', 'ě', 'è', 'e'],
        o: ['o', 'ō', 'ó', 'ǒ', 'ò', 'o'],
        i: ['i', 'ī', 'í', 'ǐ', 'ì', 'i'],
        u: ['u', 'ū', 'ú', 'ǔ', 'ù', 'u'],
        v: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'],
        A: ['A', 'Ā', 'Á', 'Ǎ', 'À', 'A'],
        E: ['E', 'Ē', 'É', 'Ě', 'È', 'E'],
        O: ['O', 'Ō', 'Ó', 'Ǒ', 'Ò', 'O'],
        I: ['I', 'Ī', 'Í', 'Ǐ', 'Ì', 'I'],
        U: ['U', 'Ū', 'Ú', 'Ǔ', 'Ù', 'U'],
        V: ['Ü', 'Ǖ', 'Ǘ', 'Ǚ', 'Ǜ', 'Ü'],
    };

    // Pre-convert 'v' or 'u:' to 'ü'
    let processed = text.replace(/v/g, 'ü').replace(/V/g, 'Ü');
    processed = processed.replace(/u:/g, 'ü').replace(/U:/g, 'Ü');

    // Pattern: 1-3 vowels followed by a tone number (1-5)
    // We use a broad regex and then apply priority rules
    return processed.replace(/([aeiouüAEIOUÜ]{1,3})([1-5])/g, (match, vowels, toneNum) => {
        const tone = parseInt(toneNum);
        let targetVowel = '';
        let targetIndex = -1;

        const lowerVowels = vowels.toLowerCase();

        // Rules for tone placement:
        // 1. If 'a' is present, it gets the tone
        if (lowerVowels.indexOf('a') !== -1) {
            targetVowel = vowels[lowerVowels.indexOf('a')];
            targetIndex = lowerVowels.indexOf('a');
        }
        // 2. If 'e' is present, it gets the tone
        else if (lowerVowels.indexOf('e') !== -1) {
            targetVowel = vowels[lowerVowels.indexOf('e')];
            targetIndex = lowerVowels.indexOf('e');
        }
        // 3. If 'ou' is present, 'o' gets the tone
        else if (lowerVowels.indexOf('ou') !== -1) {
            targetVowel = vowels[lowerVowels.indexOf('o')];
            targetIndex = lowerVowels.indexOf('o');
        }
        // 4. Otherwise, the LAST vowel gets the tone (covers ui, iu)
        else {
            targetIndex = vowels.length - 1;
            targetVowel = vowels[targetIndex];
        }

        if (targetVowel && toneMap[targetVowel]) {
            const accented = toneMap[targetVowel][tone];
            return vowels.substring(0, targetIndex) + accented + vowels.substring(targetIndex + 1);
        }

        return match;
    });
}
