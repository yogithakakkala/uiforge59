import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Play, RotateCcw, Maximize2, Minimize2, Terminal, BookOpen, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CodeEditor } from "@/components/CodeEditor";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const templates = {
  blank: {
    label: "Blank",
    html: "",
    css: "",
    js: "",
  },
  starter: {
    label: "Hello World",
    html: `<div class="container">\n  <h1>Hello World!</h1>\n  <p>Start coding here...</p>\n  <button id="myBtn">Click Me</button>\n</div>`,
    css: `.container {\n  padding: 2rem;\n  text-align: center;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  color: #6366f1;\n  margin-bottom: 1rem;\n}\n\nbutton {\n  background: #6366f1;\n  color: white;\n  border: none;\n  padding: 0.75rem 1.5rem;\n  border-radius: 0.5rem;\n  cursor: pointer;\n  font-size: 1rem;\n}\n\nbutton:hover {\n  background: #4f46e5;\n}`,
    js: `const btn = document.getElementById('myBtn');\nlet count = 0;\n\nbtn.addEventListener('click', () => {\n  count++;\n  btn.textContent = \`Clicked \${count} times!\`;\n});`,
  },
  flexbox: {
    label: "Flexbox Layout",
    html: `<div class="flex-container">\n  <div class="card">Card 1</div>\n  <div class="card">Card 2</div>\n  <div class="card">Card 3</div>\n</div>`,
    css: `.flex-container {\n  display: flex;\n  gap: 1rem;\n  padding: 2rem;\n  justify-content: center;\n  flex-wrap: wrap;\n}\n\n.card {\n  background: linear-gradient(135deg, #667eea, #764ba2);\n  color: white;\n  padding: 2rem 3rem;\n  border-radius: 1rem;\n  font-family: system-ui;\n  font-size: 1.25rem;\n  font-weight: 600;\n  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);\n  transition: transform 0.2s;\n}\n\n.card:hover {\n  transform: translateY(-4px);\n}`,
    js: "",
  },
  grid: {
    label: "CSS Grid",
    html: `<div class="grid-container">\n  <div class="item header">Header</div>\n  <div class="item sidebar">Sidebar</div>\n  <div class="item main">Main Content</div>\n  <div class="item footer">Footer</div>\n</div>`,
    css: `.grid-container {\n  display: grid;\n  grid-template-areas:\n    "header header"\n    "sidebar main"\n    "footer footer";\n  grid-template-columns: 200px 1fr;\n  grid-template-rows: auto 1fr auto;\n  gap: 0.5rem;\n  padding: 1rem;\n  height: 100vh;\n  font-family: system-ui;\n}\n\n.item {\n  padding: 1.5rem;\n  border-radius: 0.75rem;\n  font-weight: 600;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.header { grid-area: header; background: #1e293b; color: #f8fafc; }\n.sidebar { grid-area: sidebar; background: #334155; color: #f8fafc; }\n.main { grid-area: main; background: #0f172a; color: #22d3ee; }\n.footer { grid-area: footer; background: #1e293b; color: #94a3b8; }`,
    js: "",
  },
  animation: {
    label: "CSS Animation",
    html: `<div class="scene">\n  <div class="ball"></div>\n  <div class="shadow"></div>\n</div>`,
    css: `.scene {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  height: 100vh;\n  background: #0f172a;\n}\n\n.ball {\n  width: 60px;\n  height: 60px;\n  border-radius: 50%;\n  background: linear-gradient(135deg, #22d3ee, #6366f1);\n  animation: bounce 0.8s ease-in-out infinite alternate;\n  box-shadow: 0 0 30px rgba(34, 211, 238, 0.5);\n}\n\n.shadow {\n  width: 60px;\n  height: 10px;\n  border-radius: 50%;\n  background: rgba(34, 211, 238, 0.2);\n  margin-top: 20px;\n  animation: shadowPulse 0.8s ease-in-out infinite alternate;\n}\n\n@keyframes bounce {\n  from { transform: translateY(0); }\n  to { transform: translateY(-120px); }\n}\n\n@keyframes shadowPulse {\n  from { transform: scaleX(1); opacity: 0.4; }\n  to { transform: scaleX(0.5); opacity: 0.1; }\n}`,
    js: "",
  },
  form: {
    label: "Form Validation",
    html: `<form id="myForm" class="form">\n  <h2>Sign Up</h2>\n  <div class="field">\n    <label>Email</label>\n    <input type="email" id="email" placeholder="you@example.com" />\n    <span class="error" id="emailError"></span>\n  </div>\n  <div class="field">\n    <label>Password</label>\n    <input type="password" id="password" placeholder="Min 6 characters" />\n    <span class="error" id="passError"></span>\n  </div>\n  <button type="submit">Sign Up</button>\n</form>`,
    css: `.form {\n  max-width: 380px;\n  margin: 3rem auto;\n  padding: 2rem;\n  background: #1e293b;\n  border-radius: 1rem;\n  font-family: system-ui;\n  color: #f8fafc;\n}\n\nh2 { margin-bottom: 1.5rem; text-align: center; }\n\n.field {\n  margin-bottom: 1rem;\n}\n\nlabel {\n  display: block;\n  font-size: 0.875rem;\n  color: #94a3b8;\n  margin-bottom: 0.25rem;\n}\n\ninput {\n  width: 100%;\n  padding: 0.75rem;\n  border: 1px solid #334155;\n  border-radius: 0.5rem;\n  background: #0f172a;\n  color: #f8fafc;\n  font-size: 1rem;\n}\n\ninput:focus {\n  outline: none;\n  border-color: #6366f1;\n  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);\n}\n\n.error {\n  color: #f87171;\n  font-size: 0.75rem;\n  min-height: 1rem;\n  display: block;\n  margin-top: 0.25rem;\n}\n\nbutton {\n  width: 100%;\n  padding: 0.75rem;\n  background: #6366f1;\n  color: white;\n  border: none;\n  border-radius: 0.5rem;\n  font-size: 1rem;\n  cursor: pointer;\n  margin-top: 0.5rem;\n}\n\nbutton:hover { background: #4f46e5; }`,
    js: `document.getElementById('myForm').addEventListener('submit', (e) => {\n  e.preventDefault();\n  let valid = true;\n  const email = document.getElementById('email');\n  const password = document.getElementById('password');\n  const emailErr = document.getElementById('emailError');\n  const passErr = document.getElementById('passError');\n\n  emailErr.textContent = '';\n  passErr.textContent = '';\n\n  if (!email.value.includes('@')) {\n    emailErr.textContent = 'Please enter a valid email';\n    valid = false;\n  }\n  if (password.value.length < 6) {\n    passErr.textContent = 'Password must be at least 6 characters';\n    valid = false;\n  }\n  if (valid) {\n    console.log('Form submitted!', { email: email.value });\n    alert('Sign up successful!');\n  }\n});`,
  },
};

type TemplateKey = keyof typeof templates;

export default function PracticePage() {
  const [html, setHtml] = useState(templates.starter.html);
  const [css, setCss] = useState(templates.starter.css);
  const [js, setJs] = useState(templates.starter.js);
  const [iframeKey, setIframeKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<Array<{ type: string; message: string }>>([]);
  const [autoRun, setAutoRun] = useState(false);
  const autoRunTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-run debounced
  useEffect(() => {
    if (!autoRun) return;
    if (autoRunTimer.current) clearTimeout(autoRunTimer.current);
    autoRunTimer.current = setTimeout(() => {
      setIframeKey((prev) => prev + 1);
    }, 800);
    return () => {
      if (autoRunTimer.current) clearTimeout(autoRunTimer.current);
    };
  }, [html, css, js, autoRun]);

  const iframeSrcDoc = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data: blob: https:;" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    // Override console to post messages to parent
    (function() {
      const origLog = console.log;
      const origError = console.error;
      const origWarn = console.warn;
      function send(type, args) {
        try {
          window.parent.postMessage({ source: 'practice-preview', type, message: Array.from(args).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
        } catch(e) {}
      }
      console.log = function() { send('log', arguments); origLog.apply(console, arguments); };
      console.error = function() { send('error', arguments); origError.apply(console, arguments); };
      console.warn = function() { send('warn', arguments); origWarn.apply(console, arguments); };
    })();
    try {
      ${js}
    } catch (e) {
      console.error('Script error:', e.message);
    }
  </script>
</body>
</html>`;
  }, [html, css, js]);

  // Listen for console messages from iframe
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.source === 'practice-preview') {
        setConsoleLogs((prev) => [...prev.slice(-99), { type: event.data.type, message: event.data.message }]);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleRun = () => {
    setConsoleLogs([]);
    setIframeKey((prev) => prev + 1);
    toast.success("Code executed!");
  };

  const handleReset = () => {
    loadTemplate("starter");
    toast.info("Code reset to defaults");
  };

  const loadTemplate = (key: TemplateKey) => {
    const t = templates[key];
    setHtml(t.html);
    setCss(t.css);
    setJs(t.js);
    setConsoleLogs([]);
    setIframeKey((prev) => prev + 1);
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
          {/* Templates */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <BookOpen className="w-4 h-4 mr-1" />
                Templates
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(templates).map(([key, t]) => (
                <DropdownMenuItem key={key} onClick={() => loadTemplate(key as TemplateKey)}>
                  {t.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auto-run toggle */}
          <Button
            variant={autoRun ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRun(!autoRun)}
            title="Auto-run on code changes"
          >
            {autoRun ? "Auto ●" : "Auto ○"}
          </Button>

          {/* Console toggle */}
          <Button
            variant={showConsole ? "default" : "outline"}
            size="sm"
            onClick={() => setShowConsole(!showConsole)}
          >
            <Terminal className="w-4 h-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button variant="glow" size="sm" onClick={handleRun}>
            <Play className="w-4 h-4" />
            Run
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
            <CodeEditor
              value={html}
              onChange={setHtml}
              language="html"
              placeholder="Write your HTML here..."
            />
          </div>

          {/* CSS Panel */}
          <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-border min-h-[200px]">
            <div className="px-3 py-2 border-b border-border bg-muted/50 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm font-medium">CSS</span>
            </div>
            <CodeEditor
              value={css}
              onChange={setCss}
              language="css"
              placeholder="Write your CSS here..."
            />
          </div>

          {/* JS Panel */}
          <div className="flex-1 flex flex-col min-h-[200px]">
            <div className="px-3 py-2 border-b border-border bg-muted/50 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm font-medium">JavaScript</span>
            </div>
            <CodeEditor
              value={js}
              onChange={setJs}
              language="javascript"
              placeholder="Write your JavaScript here..."
            />
          </div>
        </div>

        {/* Preview + Console */}
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
          <div className={`flex-1 bg-white ${showConsole ? 'min-h-0' : ''}`}>
            <iframe
              key={iframeKey}
              srcDoc={iframeSrcDoc}
              className="w-full h-full border-0"
              sandbox="allow-scripts"
              title="Practice Preview"
            />
          </div>

          {/* Console Panel */}
          {showConsole && (
            <div className="h-[180px] border-t border-border flex flex-col bg-card">
              <div className="px-3 py-1.5 border-b border-border bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Console</span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => setConsoleLogs([])}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <ScrollArea className="flex-1 p-2">
                {consoleLogs.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No console output yet</p>
                ) : (
                  consoleLogs.map((log, i) => (
                    <div key={i} className={`text-xs font-mono py-0.5 ${
                      log.type === 'error' ? 'text-red-400' : log.type === 'warn' ? 'text-yellow-400' : 'text-foreground'
                    }`}>
                      <span className="text-muted-foreground mr-1.5">›</span>
                      {log.message}
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
