import { useState } from "react";
import { Wand2, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUIStore } from "@/store/uiStore";
import { useNavigate } from "react-router-dom";

const examplePrompts = [
  "A modern login form with email and password fields",
  "A pricing card with popular badge and features list",
  "A hero section with gradient background and CTA button",
  "A testimonial carousel with avatar and star ratings",
];

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const { isGenerating, setIsGenerating, setGeneratedUI } = useUIStore();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation (replace with actual AI call later)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const generatedCode = generateMockUI(prompt);
    setGeneratedUI({
      ...generatedCode,
      prompt,
      timestamp: new Date(),
    });
    
    setIsGenerating(false);
    navigate("/preview");
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

// Mock UI generator (replace with actual AI later)
function generateMockUI(prompt: string) {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes("login") || lowerPrompt.includes("form")) {
    return {
      html: `<div class="login-container">
  <div class="login-card">
    <h2 class="title">Welcome Back</h2>
    <p class="subtitle">Sign in to continue</p>
    
    <form class="form">
      <div class="input-group">
        <label for="email">Email</label>
        <input type="email" id="email" placeholder="you@example.com">
      </div>
      
      <div class="input-group">
        <label for="password">Password</label>
        <input type="password" id="password" placeholder="••••••••">
      </div>
      
      <button type="submit" class="submit-btn">Sign In</button>
    </form>
    
    <p class="footer-text">
      Don't have an account? <a href="#">Sign up</a>
    </p>
  </div>
</div>`,
      css: `.login-container {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
  background: #1e293b;
  border-radius: 1rem;
  border: 1px solid #334155;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #94a3b8;
  margin-bottom: 2rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #e2e8f0;
}

.input-group input {
  padding: 0.75rem 1rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #f8fafc;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input-group input:focus {
  outline: none;
  border-color: #22d3ee;
}

.input-group input::placeholder {
  color: #64748b;
}

.submit-btn {
  margin-top: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%);
  border: none;
  border-radius: 0.5rem;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
}

.submit-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.footer-text {
  margin-top: 1.5rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.875rem;
}

.footer-text a {
  color: #22d3ee;
  text-decoration: none;
  font-weight: 500;
}

.footer-text a:hover {
  text-decoration: underline;
}`,
      js: `// Form submission handler
document.querySelector('.form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  console.log('Login attempt:', { email, password });
  
  // Add your authentication logic here
  alert('Login form submitted!');
});`
    };
  }
  
  // Default card component
  return {
    html: `<div class="card-container">
  <div class="card">
    <div class="card-header">
      <span class="badge">New</span>
      <h3 class="card-title">Beautiful Component</h3>
    </div>
    <p class="card-description">
      This is a sample UI component generated based on your prompt. 
      Customize it to match your needs.
    </p>
    <div class="card-actions">
      <button class="btn-primary">Get Started</button>
      <button class="btn-secondary">Learn More</button>
    </div>
  </div>
</div>`,
    css: `.card-container {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: #1e293b;
  border-radius: 1rem;
  border: 1px solid #334155;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #0f172a;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
}

.card-description {
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-primary {
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%);
  border: none;
  border-radius: 0.5rem;
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #e2e8f0;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #334155;
}`,
    js: `// Button click handlers
document.querySelector('.btn-primary').addEventListener('click', function() {
  console.log('Primary button clicked!');
  alert('Getting started...');
});

document.querySelector('.btn-secondary').addEventListener('click', function() {
  console.log('Secondary button clicked!');
  alert('Learn more clicked!');
});`
  };
}
