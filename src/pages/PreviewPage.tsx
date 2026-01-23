import { useMemo, useState } from "react";
import { Monitor, Tablet, Smartphone, RotateCcw, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/uiStore";
import { useNavigate } from "react-router-dom";

const viewports = [
  { id: "desktop", icon: Monitor, label: "Desktop", width: "100%" },
  { id: "tablet", icon: Tablet, label: "Tablet", width: "768px" },
  { id: "mobile", icon: Smartphone, label: "Mobile", width: "375px" },
];

export default function PreviewPage() {
  const { generatedUI, hasHydrated } = useUIStore();
  const navigate = useNavigate();
  const [activeViewport, setActiveViewport] = useState("desktop");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const iframeSrcDoc = useMemo(() => {
    if (!generatedUI) return "";

    // NOTE: We intentionally render via srcDoc because sandboxed iframes without
    // `allow-same-origin` cannot be accessed with `contentDocument`/`document.write`.
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { height: 100%; font-family: 'Inter', system-ui, sans-serif; }
      ${generatedUI.css}
    </style>
  </head>
  <body>
    ${generatedUI.html}
    <script>
      try {
        ${generatedUI.js}
      } catch (e) {
        console.error(e);
      }
    </script>
  </body>
</html>`;
  }, [generatedUI]);

  const handleRefresh = () => {
    setIframeKey((k) => k + 1);
  };

  if (!hasHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Loading preview…</p>
      </div>
    );
  }

  if (!generatedUI) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Monitor className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Preview Available</h2>
          <p className="text-muted-foreground mb-4">
            Generate a UI component first to see the preview
          </p>
          <Button onClick={() => navigate("/")}>Go to Generate</Button>
        </div>
      </div>
    );
  }

  const currentViewport = viewports.find((v) => v.id === activeViewport);

  return (
    <div className="flex-1 flex flex-col p-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Preview</h2>
          <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
            Live
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport Switcher */}
          <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
            {viewports.map((viewport) => (
              <button
                key={viewport.id}
                onClick={() => setActiveViewport(viewport.id)}
                className={`p-2 rounded-md transition-colors ${
                  activeViewport === viewport.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={viewport.label}
              >
                <viewport.icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <div
        className={`flex-1 rounded-lg border border-border bg-card overflow-hidden animate-fade-in ${
          isFullscreen ? "fixed inset-4 z-50" : ""
        }`}
        style={{ animationDelay: "0.1s" }}
      >
        <div className="h-full flex items-center justify-center bg-muted/30 p-4">
          <div
            className="h-full bg-background rounded-lg overflow-hidden shadow-2xl transition-all duration-300"
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
          </div>
        </div>
      </div>

      {/* Prompt Display */}
      <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Prompt:</span>{" "}
          {generatedUI.prompt}
        </p>
      </div>
    </div>
  );
}
