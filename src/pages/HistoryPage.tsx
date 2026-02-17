import { Clock, Trash2, Eye, Code2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/uiStore";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDbHistory } from "@/hooks/useDbHistory";
import { toast } from "sonner";

export default function HistoryPage() {
  const { history, setGeneratedUI, removeFromHistory, clearHistory } = useUIStore();
  const { deleteFromDb, clearDb } = useDbHistory();
  const navigate = useNavigate();

  const handleView = (item: typeof history[0]) => {
    setGeneratedUI(item);
    navigate("/preview");
  };

  const handleViewCode = (item: typeof history[0]) => {
    setGeneratedUI(item);
    navigate("/code");
  };

  const handleDelete = async (item: typeof history[0]) => {
    removeFromHistory(item.timestamp);
    await deleteFromDb(item.prompt);
    toast.success("Generation removed");
  };

  const handleClearAll = async () => {
    clearHistory();
    await clearDb();
    toast.success("History cleared");
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (history.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">No History Yet</h2>
          <p className="text-muted-foreground max-w-md">
            Your generated UI components will appear here. Go to the Generate page to create your first component!
          </p>
          <Button onClick={() => navigate("/")} variant="glow">
            Start Generating
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Generation History</h1>
          <p className="text-muted-foreground">
            Review and reuse your previously generated UI components
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleClearAll}>
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="grid gap-4">
          {history.map((item) => (
            <div
              key={item.timestamp}
              className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.prompt}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(item.timestamp)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => handleView(item)}>
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleViewCode(item)}>
                    <Code2 className="w-4 h-4" />
                    Code
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
