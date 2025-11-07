declare module 'react-katex' {
  import { Component } from 'react';

  export interface InlineMathProps {
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => React.ReactNode;
  }

  export interface BlockMathProps {
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => React.ReactNode;
  }

  export class InlineMath extends Component<InlineMathProps> {}
  export class BlockMath extends Component<BlockMathProps> {}
}

