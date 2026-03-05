import { useMemo, useState, useEffect } from "react";
import { Monitor, Tablet, Smartphone, RotateCcw, Maximize2, Download, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/uiStore";
import { useNavigate } from "react-router-dom";
import { PreviewEditBar } from "@/components/PreviewEditBar";
import { refineUI } from "@/lib/generateUI";
import { useDbHistory } from "@/hooks/useDbHistory";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";

const viewports = [
  { id: "desktop", icon: Monitor, label: "Desktop", width: "100%" },
  { id: "tablet", icon: Tablet, label: "Tablet", width: "768px" },
  { id: "mobile", icon: Smartphone, label: "Mobile", width: "375px" },
];

export default function PreviewPage() {
  const { generatedUI, hasHydrated, setGeneratedUI, addToHistory } = useUIStore();
  const { saveToDb } = useDbHistory();
  const navigate = useNavigate();
  const [activeViewport, setActiveViewport] = useState("desktop");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isRefining, setIsRefining] = useState(false);

  // Escape to exit fullscreen
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isFullscreen]);

  const iframeSrcDoc = useMemo(() => {
    if (!generatedUI) return "";
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data: blob: https:;" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { height: 100%; font-family: 'Inter', system-ui, sans-serif; }
      ${generatedUI.css}
    </style>
  </head>
  <body>
    ${generatedUI.html}
    <script>
      try { ${generatedUI.js} } catch (e) { console.error(e); }
    </script>
  </body>
</html>`;
  }, [generatedUI]);

  const handleRefresh = () => setIframeKey((k) => k + 1);

  const handleRefine = async (refinementPrompt: string) => {
    if (!generatedUI) return;
    setIsRefining(true);
    try {
      const refinedCode = await refineUI(
        { html: generatedUI.html, css: generatedUI.css, js: generatedUI.js },
        refinementPrompt
      );
      const updatedUI = {
        ...refinedCode,
        prompt: `${generatedUI.prompt} → ${refinementPrompt}`,
        timestamp: Date.now(),
      };
      setGeneratedUI(updatedUI);
      addToHistory(updatedUI);
      await saveToDb({ ...refinedCode, prompt: updatedUI.prompt });
      setIframeKey((k) => k + 1);
      toast.success("Preview updated!");
    } catch (error) {
      console.error("Refinement error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to refine UI");
    } finally {
      setIsRefining(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!generatedUI) return;
    const zip = new JSZip();
    const fullHtml = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Generated UI</title>\n  <style>\n${generatedUI.css}\n  </style>\n</head>\n<body>\n${generatedUI.html}\n  <script>\n${generatedUI.js}\n  </script>\n</body>\n</html>`;
    zip.file("index.html", fullHtml);
    zip.file("styles.css", generatedUI.css);
    zip.file("script.js", generatedUI.js);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ui-forge-project.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Project downloaded!");
  };

  if (!hasHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-muted-foreground"
        >
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm">Loading preview…</p>
        </motion.div>
      </div>
    );
  }

  if (!generatedUI) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-5 border border-border/50">
            <Monitor className="w-9 h-9 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Preview Available</h2>
          <p className="text-muted-foreground mb-6">Generate a UI component first to see the preview</p>
          <Button onClick={() => navigate("/")} variant="glow">Go to Generate</Button>
        </motion.div>
      </div>
    );
  }

  const currentViewport = viewports.find((v) => v.id === activeViewport);

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col p-4 lg:p-6">
        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Preview</h2>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 p-1 bg-muted/50 rounded-lg border border-border/50">
              {viewports.map((viewport) => (
                <button
                  key={viewport.id}
                  onClick={() => setActiveViewport(viewport.id)}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    activeViewport === viewport.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  title={viewport.label}
                >
                  <viewport.icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-border/50 mx-1" />

            <Button variant="ghost" size="icon" onClick={handleRefresh} className="hover:bg-muted">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownloadZip} className="gap-1.5 hover:bg-muted">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hover:bg-muted"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </motion.div>

        {/* Preview Frame */}
        <AnimatePresence>
          <motion.div
            layout
            className={`flex-1 rounded-xl border border-border/50 bg-muted/20 overflow-hidden ${
              isFullscreen ? "fixed inset-3 z-50 bg-background rounded-2xl shadow-2xl" : ""
            }`}
          >
            <div className="h-full flex items-center justify-center p-3">
              <motion.div
                layout
                className="h-full bg-background rounded-lg overflow-hidden shadow-xl transition-all duration-500 border border-border/30"
                style={{
                  width: currentViewport?.width || "100%",
                  maxWidth: "100%",
                }}
              >
                <iframe
                  key={iframeKey}
                  className="w-full h-full border-0"
                  title="UI Preview"
                  sandbox="allow-scripts"
                  srcDoc={iframeSrcDoc}
                />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Prompt Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-3 px-4 py-2.5 rounded-lg bg-muted/30 border border-border/30"
        >
          <p className="text-sm text-muted-foreground truncate">
            <span className="font-medium text-foreground">Prompt:</span>{" "}
            {generatedUI.prompt}
          </p>
        </motion.div>
      </div>

      <PreviewEditBar onRefine={handleRefine} isRefining={isRefining} />
    </div>
  );
}
