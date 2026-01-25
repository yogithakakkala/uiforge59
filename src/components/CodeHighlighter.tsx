import { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-markup";

interface CodeHighlighterProps {
  code: string;
  language: "html" | "css" | "javascript";
  className?: string;
}

export function CodeHighlighter({ code, language, className = "" }: CodeHighlighterProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const prismLanguage = language === "html" ? "markup" : language;

  return (
    <pre className={`${className} !bg-transparent !m-0 !p-0`}>
      <code
        ref={codeRef}
        className={`language-${prismLanguage} !bg-transparent text-sm font-mono whitespace-pre`}
      >
        {code}
      </code>
    </pre>
  );
}
