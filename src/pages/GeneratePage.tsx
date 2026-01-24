import { useState } from "react";
import { Wand2, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUIStore } from "@/store/uiStore";
import { useNavigate } from "react-router-dom";
import { generateUI } from "@/lib/generateUI";
import { toast } from "sonner";

const examplePrompts = [
  "A modern login form with email and password fields",
  "A pricing card with popular badge and features list",
  "A hero section with gradient background and CTA button",
  "A testimonial carousel with avatar and star ratings",
];

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const { isGenerating, setIsGenerating, setGeneratedUI, addToHistory } = useUIStore();
  const navigate = useNavigate();

  const handleGenerate = async () => {
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
      toast.success("UI generated successfully!");
      navigate("/preview");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate UI");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered UI Generation
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">
            What would you like to <span className="gradient-text">create</span>?
          </h1>
          <p className="text-muted-foreground">
            Describe your UI component and watch the magic happen
          </p>
        </div>

        {/* Prompt Input */}
        <div className="gradient-border p-1 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="bg-card rounded-lg p-4">
            <Textarea
              placeholder="Describe the UI you want to create... e.g., 'A modern contact form with name, email, and message fields'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] bg-transparent border-0 focus-visible:ring-0 resize-none text-base placeholder:text-muted-foreground/60"
            />
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {prompt.length}/500 characters
              </p>
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                variant="glow"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate UI
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Example Prompts */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <p className="text-sm text-muted-foreground mb-3">Try these examples:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="text-left p-4 rounded-lg bg-secondary/50 hover:bg-secondary border border-border hover:border-primary/30 transition-all duration-200 group"
              >
                <p className="text-sm group-hover:text-primary transition-colors">
                  "{example}"
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

