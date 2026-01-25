import { useState } from "react";
import { Wand2, Loader2, Palette, Type, Image, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PreviewEditBarProps {
  onRefine: (prompt: string) => Promise<void>;
  isRefining: boolean;
}

const quickActions = [
  { icon: Palette, label: "Colors", prompt: "Change the color scheme to" },
  { icon: Type, label: "Fonts", prompt: "Update the typography to use" },
  { icon: Image, label: "Images", prompt: "Add or modify images to" },
  { icon: Sparkles, label: "Style", prompt: "Improve the styling by" },
];

export function PreviewEditBar({ onRefine, isRefining }: PreviewEditBarProps) {
  const [editPrompt, setEditPrompt] = useState("");
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPrompt.trim() || isRefining) return;
    
    const fullPrompt = activeAction 
      ? `${activeAction} ${editPrompt}`
      : editPrompt;
    
    await onRefine(fullPrompt);
    setEditPrompt("");
    setActiveAction(null);
  };

  const handleQuickAction = (prompt: string) => {
    if (activeAction === prompt) {
      setActiveAction(null);
    } else {
      setActiveAction(prompt);
      setEditPrompt("");
    }
  };

  return (
    <div className="border-t border-border bg-card/50 backdrop-blur-sm animate-fade-in">
      {/* Quick Actions */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border overflow-x-auto">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Quick edit:</span>
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => handleQuickAction(action.prompt)}
            disabled={isRefining}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
              activeAction === action.prompt
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
            )}
          >
            <action.icon className="w-3 h-3" />
            {action.label}
          </button>
        ))}
      </div>

      {/* Edit Input */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            {activeAction && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-primary font-medium">
                {activeAction}
              </span>
            )}
            <Input
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder={
                activeAction
                  ? "Describe what you want..."
                  : "Describe changes... e.g., 'Make the button larger and add a shadow'"
              }
              disabled={isRefining}
              className={cn(
                "bg-background border-border focus-visible:ring-primary",
                activeAction && "pl-[140px]"
              )}
              style={activeAction ? { paddingLeft: `${activeAction.length * 7 + 20}px` } : undefined}
            />
          </div>
          <Button
            type="submit"
            disabled={!editPrompt.trim() || isRefining}
            variant="glow"
            size="default"
          >
            {isRefining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Refining...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Apply
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          💡 Tip: Be specific about what you want to change for better results
        </p>
      </form>
    </div>
  );
}
