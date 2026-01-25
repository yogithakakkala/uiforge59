import { useRef, useEffect, useCallback } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-markup";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: "html" | "css" | "javascript";
  placeholder?: string;
}

export function CodeEditor({ value, onChange, language, placeholder }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  const prismLanguage = language === "html" ? "markup" : language;

  const highlightCode = useCallback(() => {
    if (highlightRef.current) {
      const codeElement = highlightRef.current.querySelector("code");
      if (codeElement) {
        Prism.highlightElement(codeElement);
      }
    }
  }, []);

  useEffect(() => {
    highlightCode();
  }, [value, language, highlightCode]);

  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div className="relative flex-1 overflow-hidden bg-[#1d1f21]">
      {/* Highlighted code display (behind textarea) */}
      <pre
        ref={highlightRef}
        className="absolute inset-0 p-4 overflow-auto pointer-events-none !bg-transparent !m-0"
        aria-hidden="true"
      >
        <code className={`language-${prismLanguage} !bg-transparent text-sm font-mono whitespace-pre-wrap break-words`}>
          {value || placeholder || " "}
        </code>
      </pre>

      {/* Transparent textarea for editing */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        className="absolute inset-0 w-full h-full p-4 resize-none font-mono text-sm bg-transparent text-transparent caret-white outline-none whitespace-pre-wrap break-words"
        placeholder={placeholder}
        spellCheck={false}
        style={{ caretColor: "white" }}
      />
    </div>
  );
}
