import { useState } from "react";
import { Zap, Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { quickPrompts, quickPromptCategories, QuickPrompt } from "@/data/quickPrompts";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface QuickGeneratePanelProps {
  onSelectPrompt: (prompt: string) => void;
}

export function QuickGeneratePanel({ onSelectPrompt }: QuickGeneratePanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<string[]>(["Forms", "Cards"]);

  const filteredPrompts = searchQuery
    ? quickPrompts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.prompt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : quickPrompts;

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const getPromptsByCategory = (category: string) =>
    filteredPrompts.filter((p) => p.category === category);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Quick Generate</h3>
            <p className="text-xs text-muted-foreground">50+ ready prompts</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-secondary border-0 text-sm"
          />
        </div>
      </div>

      {/* Categories List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {searchQuery ? (
            // Show flat list when searching
            <div className="space-y-1">
              {filteredPrompts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No prompts found
                </p>
              ) : (
                filteredPrompts.map((prompt) => (
                  <PromptItem
                    key={prompt.id}
                    prompt={prompt}
                    onSelect={onSelectPrompt}
                  />
                ))
              )}
            </div>
          ) : (
            // Show categorized list
            <div className="space-y-1">
              {quickPromptCategories.map((category) => {
                const categoryPrompts = getPromptsByCategory(category);
                if (categoryPrompts.length === 0) return null;

                return (
                  <Collapsible
                    key={category}
                    open={openCategories.includes(category)}
                    onOpenChange={() => toggleCategory(category)}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg hover:bg-secondary transition-colors">
                      <span>{category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {categoryPrompts.length}
                        </span>
                        <ChevronRight
                          className={`w-4 h-4 text-muted-foreground transition-transform ${
                            openCategories.includes(category) ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-2 pl-2 border-l border-border space-y-1 mt-1">
                        {categoryPrompts.map((prompt) => (
                          <PromptItem
                            key={prompt.id}
                            prompt={prompt}
                            onSelect={onSelectPrompt}
                          />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Click any prompt to use it
        </p>
      </div>
    </div>
  );
}

function PromptItem({
  prompt,
  onSelect,
}: {
  prompt: QuickPrompt;
  onSelect: (prompt: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(prompt.prompt)}
      className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-primary/10 hover:text-primary transition-colors group"
    >
      <span className="font-medium">{prompt.title}</span>
      <p className="text-xs text-muted-foreground group-hover:text-primary/70 line-clamp-1 mt-0.5">
        {prompt.prompt}
      </p>
    </button>
  );
}
