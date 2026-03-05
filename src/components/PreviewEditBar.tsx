import { useState } from "react";
import { Wand2, Loader2, Palette, Type, Layout, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PreviewEditBarProps {
  onRefine: (prompt: string) => Promise<void>;
  isRefining: boolean;
}

const quickActions = [
  { icon: Palette, label: "Colors", prompt: "Change the color scheme to" },
  { icon: Type, label: "Typography", prompt: "Update the typography to use" },
  { icon: Layout, label: "Layout", prompt: "Restructure the layout to" },
  { icon: Sparkles, label: "Polish", prompt: "Improve the styling by" },
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
    <div className="border-t border-border/50 bg-card/30 backdrop-blur-md">
      {/* Quick Actions */}
      <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto">
        <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">Edit:</span>
        {quickActions.map((action) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleQuickAction(action.prompt)}
            disabled={isRefining}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border",
              activeAction === action.prompt
                ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                : "bg-muted/50 hover:bg-muted border-border/50 text-muted-foreground hover:text-foreground"
            )}
          >
            <action.icon className="w-3 h-3" />
            {action.label}
          </motion.button>
        ))}
      </div>

      {/* Edit Input */}
      <form onSubmit={handleSubmit} className="px-4 pb-4 pt-1">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <AnimatePresence>
              {activeAction && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-primary font-medium"
                >
                  {activeAction}
                </motion.span>
              )}
            </AnimatePresence>
            <Input
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder={
                activeAction
                  ? "Describe what you want..."
                  : "Describe changes... e.g., 'Make the button larger'"
              }
              disabled={isRefining}
              className={cn(
                "bg-background/50 border-border/50 focus:border-primary/50 pr-20",
                activeAction && "pl-[140px]"
              )}
              style={activeAction ? { paddingLeft: `${activeAction.length * 7 + 20}px` } : undefined}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>
          <Button
            type="submit"
            disabled={!editPrompt.trim() || isRefining}
            variant="glow"
            size="default"
            className="shrink-0"
          >
            {isRefining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Refining
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Apply
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
