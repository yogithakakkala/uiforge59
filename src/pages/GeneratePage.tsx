import { useState, useEffect, useCallback } from "react";
import { Wand2, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUIStore } from "@/store/uiStore";
import { useNavigate } from "react-router-dom";
import { generateUI } from "@/lib/generateUI";
import { useDbHistory } from "@/hooks/useDbHistory";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const examplePrompts = [
  "A modern login form with email and password fields",
  "A pricing card with popular badge and features list",
  "A hero section with gradient background and CTA button",
  "A testimonial carousel with avatar and star ratings",
  "A dashboard stats grid with animated counters",
  "A file upload dropzone with progress indicator",
];

const rotatingPhrases = [
  "a stunning login page",
  "a pricing table",
  "a dashboard layout",
  "a contact form",
  "a hero section",
  "a navigation bar",
];

function useRotatingText(phrases: string[], interval = 3000) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % phrases.length), interval);
    return () => clearInterval(timer);
  }, [phrases.length, interval]);
  return phrases[index];
}

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const { isGenerating, setIsGenerating, setGeneratedUI, addToHistory } = useUIStore();
  const { saveToDb } = useDbHistory();
  const navigate = useNavigate();
  const rotatingText = useRotatingText(rotatingPhrases);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isGenerating) {
      setElapsedTime(0);
      timer = setInterval(() => setElapsedTime((t) => t + 0.1), 100);
    }
    return () => clearInterval(timer);
  }, [isGenerating]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      const generatedCode = await generateUI(prompt);
      const uiData = {
        ...generatedCode,
        prompt,
        timestamp: Date.now(),
      };
      setGeneratedUI(uiData);
      addToHistory(uiData);
      await saveToDb({ ...generatedCode, prompt });
      toast.success("UI generated successfully!");
      navigate("/preview");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate UI");
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, setIsGenerating, setGeneratedUI, addToHistory, saveToDb, navigate]);

  return (
    <div className="flex-1 p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered UI Generation
          </motion.div>
          <h1 className="text-3xl lg:text-5xl font-bold mb-4 tracking-tight">
            Create{" "}
            <AnimatePresence mode="wait">
              <motion.span
                key={rotatingText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="gradient-text inline-block"
              >
                {rotatingText}
              </motion.span>
            </AnimatePresence>
          </h1>
          <p className="text-muted-foreground text-lg">
            Describe your UI component and watch it come to life
          </p>
        </motion.div>

        {/* Prompt Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="gradient-border p-[1px] mb-8 rounded-xl"
        >
          <div className="bg-card rounded-xl p-5 relative">
            <Textarea
              placeholder="Describe the UI you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 1000))}
              maxLength={1000}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleGenerate();
                }
              }}
              className="min-h-[130px] bg-transparent border-0 focus-visible:ring-0 resize-none text-base placeholder:text-muted-foreground/50 leading-relaxed"
            />
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-3">
                <p className="text-xs text-muted-foreground">
                  {prompt.length}/1000
                </p>
                {isGenerating && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-primary font-mono"
                  >
                    {elapsedTime.toFixed(1)}s
                  </motion.p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  ⌘+Enter
                </span>
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  variant="glow"
                  size="lg"
                  className="min-w-[140px]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Example Prompts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Try these examples
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {examplePrompts.map((example, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05, duration: 0.3 }}
                onClick={() => setPrompt(example)}
                className="group text-left p-4 rounded-xl bg-card/50 hover:bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                  {example}
                </p>
                <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 mt-2 translate-x-0 group-hover:translate-x-1" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
