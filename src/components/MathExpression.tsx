import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathExpressionProps {
  expression: string;
  display?: boolean;
}

export const MathExpression: React.FC<MathExpressionProps> = ({ expression, display = false }) => {
  try {
    if (display) {
      return <BlockMath math={expression} />;
    }
    return <InlineMath math={expression} />;
  } catch (error) {
    console.warn('Failed to render math expression:', expression, error);
    return <span style={{ color: 'red' }}>{expression}</span>;
  }
};

// Helper function to detect and render math expressions in text
export const renderTextWithMath = (text: string): React.ReactNode[] => {
  // Pattern to match LaTeX expressions: $...$ for inline, $$...$$ for display
  const mathPattern = /(\$\$[^$]+\$\$|\$[^$]+\$)/g;
  const parts = text.split(mathPattern);
  
  return parts.map((part, index) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      // Display math
      const expression = part.slice(2, -2);
      return <MathExpression key={index} expression={expression} display={true} />;
    } else if (part.startsWith('$') && part.endsWith('$')) {
      // Inline math
      const expression = part.slice(1, -1);
      return <MathExpression key={index} expression={expression} display={false} />;
    } else {
      return <span key={index}>{part}</span>;
    }
  });
};

// Helper function to convert common mathematical notation to LaTeX
export const convertToLatex = (text: string): string => {
  return text
    // Convert superscripts: x^2 -> x^{2}, x^y -> x^{y}
    .replace(/(\w+)\^(\w+)/g, '$1^{$2}')
    // Convert subscripts: H_2O -> H_{2}O, CO_2 -> CO_{2}
    .replace(/(\w+)_(\w+)/g, '$1_{$2}')
    // Convert fractions: 1/2 -> \frac{1}{2}
    .replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}')
    // Convert square roots: sqrt(x) -> \sqrt{x}
    .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
    // Convert chemical equations: -> -> \rightarrow, <-> -> \leftrightarrow
    .replace(/->/g, '\\rightarrow')
    .replace(/<->/g, '\\leftrightarrow')
    // Convert Greek letters: alpha -> \alpha, beta -> \beta, etc.
    .replace(/\balpha\b/g, '\\alpha')
    .replace(/\bbeta\b/g, '\\beta')
    .replace(/\bgamma\b/g, '\\gamma')
    .replace(/\bdelta\b/g, '\\delta')
    .replace(/\bepsilon\b/g, '\\epsilon')
    .replace(/\btheta\b/g, '\\theta')
    .replace(/\blambda\b/g, '\\lambda')
    .replace(/\bmu\b/g, '\\mu')
    .replace(/\bpi\b/g, '\\pi')
    .replace(/\bsigma\b/g, '\\sigma')
    .replace(/\btau\b/g, '\\tau')
    .replace(/\bphi\b/g, '\\phi')
    .replace(/\bomega\b/g, '\\omega')
    // Enhanced chemical formula processing
    .replace(/([A-Z][a-z]?)(\d+)/g, '$1_{$2}') // Handle formulas like H2O -> H_{2}O
    .replace(/([A-Z][a-z]?)(\d+)([A-Z][a-z]?)/g, '$1_{$2}$3') // Handle complex formulas
    // Convert ions with charges
    .replace(/([A-Z][a-z]?)\+/g, '$1^+')
    .replace(/([A-Z][a-z]?)\-/g, '$1^-')
    .replace(/([A-Z][a-z]?)\^(\d+)\+/g, '$1^{$2+}')
    .replace(/([A-Z][a-z]?)\^(\d+)\-/g, '$1^{$2-}');
};

export default MathExpression;
