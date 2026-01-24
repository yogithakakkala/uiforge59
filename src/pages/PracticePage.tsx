import { useState, useMemo } from "react";
import { Play, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const defaultHTML = `<div class="container">
  <h1>Hello World!</h1>
  <p>Start coding here...</p>
  <button id="myBtn">Click Me</button>
</div>`;

const defaultCSS = `.container {
  padding: 2rem;
  text-align: center;
  font-family: system-ui, sans-serif;
}

h1 {
  color: #6366f1;
  margin-bottom: 1rem;
}

button {
  background: #6366f1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background: #4f46e5;
}`;

const defaultJS = `const btn = document.getElementById('myBtn');
let count = 0;

btn.addEventListener('click', () => {
  count++;
  btn.textContent = \`Clicked \${count} times!\`;
});`;

export default function PracticePage() {
  const [html, setHtml] = useState(defaultHTML);
  const [css, setCss] = useState(defaultCSS);
  const [js, setJs] = useState(defaultJS);
  const [iframeKey, setIframeKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const iframeSrcDoc = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    try {
      ${js}
    } catch (e) {
      console.error('Script error:', e);
    }
  </script>
</body>
</html>`;
  }, [html, css, js]);

  const handleRun = () => {
    setIframeKey((prev) => prev + 1);
    toast.success("Code executed!");
  };

  const handleReset = () => {
    setHtml(defaultHTML);
    setCss(defaultCSS);
    setJs(defaultJS);
    setIframeKey((prev) => prev + 1);
    toast.info("Code reset to defaults");
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold gradient-text">Practice Playground</h1>
          <p className="text-sm text-muted-foreground">
            Write HTML, CSS & JavaScript and see it run live
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button variant="glow" size="sm" onClick={handleRun}>
            <Play className="w-4 h-4" />
            Run Code
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Code Panels */}
        <div className="flex-1 flex flex-col lg:flex-row border-b lg:border-b-0 lg:border-r border-border overflow-hidden">
          {/* HTML Panel */}
          <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-border min-h-[200px]">
            <div className="px-3 py-2 border-b border-border bg-muted/50 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-sm font-medium">HTML</span>
            </div>
            <Textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="flex-1 resize-none rounded-none border-0 font-mono text-sm bg-background focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Write your HTML here..."
            />
          </div>

          {/* CSS Panel */}
          <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-border min-h-[200px]">
            <div className="px-3 py-2 border-b border-border bg-muted/50 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm font-medium">CSS</span>
            </div>
            <Textarea
              value={css}
              onChange={(e) => setCss(e.target.value)}
              className="flex-1 resize-none rounded-none border-0 font-mono text-sm bg-background focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Write your CSS here..."
            />
          </div>

          {/* JS Panel */}
          <div className="flex-1 flex flex-col min-h-[200px]">
            <div className="px-3 py-2 border-b border-border bg-muted/50 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm font-medium">JavaScript</span>
            </div>
            <Textarea
              value={js}
              onChange={(e) => setJs(e.target.value)}
              className="flex-1 resize-none rounded-none border-0 font-mono text-sm bg-background focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Write your JavaScript here..."
            />
          </div>
        </div>

        {/* Preview Panel */}
        <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'lg:w-[400px] min-h-[300px]'}`}>
          <div className="px-3 py-2 border-b border-border bg-muted/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Preview</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="flex-1 bg-white">
            <iframe
              key={iframeKey}
              srcDoc={iframeSrcDoc}
              className="w-full h-full border-0"
              sandbox="allow-scripts"
              title="Practice Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
