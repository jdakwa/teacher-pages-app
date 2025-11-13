/**
 * Converts simple mathematical notation to Unicode characters
 * Examples:
 * - sin^(-1) → sin⁻¹
 * - x^2 → x²
 * - 1/2 → ½
 * - pi → π
 * - sqrt → √
 */

const superscriptMap: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
    '+': '⁺',
    '-': '⁻',
    '=': '⁼',
    '(': '⁽',
    ')': '⁾',
    'n': 'ⁿ',
    'i': 'ⁱ',
};

const subscriptMap: Record<string, string> = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
    '+': '₊',
    '-': '₋',
    '=': '₌',
    '(': '₍',
    ')': '₎',
    'a': 'ₐ',
    'e': 'ₑ',
    'o': 'ₒ',
    'x': 'ₓ',
    'h': 'ₕ',
    'k': 'ₖ',
    'l': 'ₗ',
    'm': 'ₘ',
    'n': 'ₙ',
    'p': 'ₚ',
    's': 'ₛ',
    't': 'ₜ',
};

const fractionMap: Record<string, string> = {
    '1/2': '½',
    '1/3': '⅓',
    '2/3': '⅔',
    '1/4': '¼',
    '3/4': '¾',
    '1/5': '⅕',
    '2/5': '⅖',
    '3/5': '⅗',
    '4/5': '⅘',
    '1/6': '⅙',
    '5/6': '⅚',
    '1/8': '⅛',
    '3/8': '⅜',
    '5/8': '⅝',
    '7/8': '⅞',
};

const greekLetterMap: Record<string, string> = {
    'alpha': 'α',
    'beta': 'β',
    'gamma': 'γ',
    'delta': 'δ',
    'epsilon': 'ε',
    'zeta': 'ζ',
    'eta': 'η',
    'theta': 'θ',
    'iota': 'ι',
    'kappa': 'κ',
    'lambda': 'λ',
    'mu': 'μ',
    'nu': 'ν',
    'xi': 'ξ',
    'omicron': 'ο',
    'pi': 'π',
    'rho': 'ρ',
    'sigma': 'σ',
    'tau': 'τ',
    'upsilon': 'υ',
    'phi': 'φ',
    'chi': 'χ',
    'psi': 'ψ',
    'omega': 'ω',
    'Alpha': 'Α',
    'Beta': 'Β',
    'Gamma': 'Γ',
    'Delta': 'Δ',
    'Epsilon': 'Ε',
    'Zeta': 'Ζ',
    'Eta': 'Η',
    'Theta': 'Θ',
    'Iota': 'Ι',
    'Kappa': 'Κ',
    'Lambda': 'Λ',
    'Mu': 'Μ',
    'Nu': 'Ν',
    'Xi': 'Ξ',
    'Omicron': 'Ο',
    'Pi': 'Π',
    'Rho': 'Ρ',
    'Sigma': 'Σ',
    'Tau': 'Τ',
    'Upsilon': 'Υ',
    'Phi': 'Φ',
    'Chi': 'Χ',
    'Psi': 'Ψ',
    'Omega': 'Ω',
};

function toSuperscript(text: string): string {
    return text.split('').map(char => superscriptMap[char] || char).join('');
}

function toSubscript(text: string): string {
    return text.split('').map(char => subscriptMap[char] || char).join('');
}

/**
 * Convert simple mathematical notation to Unicode
 */
export function convertToUnicode(text: string): string {
    if (!text) return text;

    let result = text;

    // 1. Convert inverse trig functions FIRST: sin^(-1) → sin⁻¹
    // Must match exactly: ^(-1) with the minus sign
    result = result.replace(/\b(sin|cos|tan|sec|csc|cot)\^\(-1\)/gi, (match, func) => {
        return func + '⁻¹';
    });

    // 2. Convert fractions: 1/2 → ½
    Object.entries(fractionMap).forEach(([fraction, unicode]) => {
        const regex = new RegExp(fraction.replace('/', '\\/'), 'g');
        result = result.replace(regex, unicode);
    });

    // 3. Convert complex exponents BEFORE simple ones: e^(2x) → e^⁽²ˣ⁾
    // But skip if it's inverse trig (already converted in step 1)
    result = result.replace(/\^(\([^)]+\))/g, (match, content, offset, string) => {
        // Check if this is preceded by a trig function (which means it's inverse trig)
        const beforeMatch = string.substring(Math.max(0, offset - 10), offset);
        if (/(?:sin|cos|tan|sec|csc|cot)$/.test(beforeMatch)) {
            return match;
        }

        const inner = content.slice(1, -1).trim();
        if (inner === '-1' || inner === '1') {
            return match;
        }

        const converted = toSuperscript(content);
        return converted;
    });

    // 4. Convert simple exponents: x^2 → x²
    result = result.replace(/\^([0-9+-]+)/g, (match, exp) => {
        return toSuperscript(exp);
    });

    // 5. Convert subscripts: H_2O → H₂O
    result = result.replace(/_([0-9a-z+-]+)/gi, (match, sub) => {
        return toSubscript(sub);
    });

    // 6. Convert Greek letters: pi → π, theta → θ
    Object.entries(greekLetterMap).forEach(([name, symbol]) => {
        const regex = new RegExp(`\\b${name}\\b`, 'g');
        result = result.replace(regex, symbol);
    });

    // 7. Convert sqrt to √
    result = result.replace(/\bsqrt\b/g, '√');

    // 8. Convert degree symbol
    result = result.replace(/\bdegrees?\b/gi, '°');

    // 9. Convert common symbols
    result = result.replace(/<=>/g, '⇔');
    result = result.replace(/<->/g, '↔');
    result = result.replace(/->/g, '→');
    result = result.replace(/<=/g, '≤');
    result = result.replace(/>=/g, '≥');
    result = result.replace(/!=/g, '≠');
    result = result.replace(/\+\/-/g, '±');
    result = result.replace(/\*\*/g, '×');

    return result;
}

/**
 * Apply Unicode conversion to all string fields in an object
 */
export function convertObjectToUnicode<T extends Record<string, any>>(obj: T): T {
    const result = { ...obj };

    for (const key in result) {
        if (typeof result[key] === 'string') {
            result[key] = convertToUnicode(result[key]) as any;
        } else if (typeof result[key] === 'object' && result[key] !== null) {
            result[key] = convertObjectToUnicode(result[key]) as any;
        }
    }

    return result;
}

