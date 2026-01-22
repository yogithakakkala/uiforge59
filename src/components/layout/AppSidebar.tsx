import { useState } from "react";
import { Wand2, Eye, Code2, GraduationCap, Sparkles, Zap, ChevronDown } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { QuickGeneratePanel } from "./QuickGeneratePanel";
import { useUIStore } from "@/store/uiStore";

const navItems = [
  { title: "Generate", url: "/", icon: Wand2, description: "Create UI from prompts" },
  { title: "Preview", url: "/preview", icon: Eye, description: "View your creation" },
  { title: "Code & Learn", url: "/code", icon: Code2, description: "Explore the code" },
  { title: "AI Tutor", url: "/tutor", icon: GraduationCap, description: "Get guided help" },
];

export function AppSidebar() {
  const [quickGenerateOpen, setQuickGenerateOpen] = useState(false);
  const navigate = useNavigate();
  const { setGeneratedUI, setIsGenerating } = useUIStore();

  const handleQuickPrompt = async (prompt: string) => {
    setQuickGenerateOpen(false);
    navigate("/");
    
    // Trigger generation with the selected prompt
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const generatedCode = generateQuickUI(prompt);
    setGeneratedUI({
      ...generatedCode,
      prompt,
      timestamp: new Date(),
    });
    
    setIsGenerating(false);
    navigate("/preview");
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-lg gradient-text">UI Forge</h1>
            <p className="text-xs text-muted-foreground">AI-Powered UI Builder</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-auto py-3">
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-secondary group"
                      activeClassName="bg-secondary text-primary border border-primary/30 glow-primary"
                    >
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Quick Generate Collapsible */}
              <SidebarMenuItem>
                <Collapsible open={quickGenerateOpen} onOpenChange={setQuickGenerateOpen}>
                  <CollapsibleTrigger className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-secondary group w-full">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                      <Zap className="w-4 h-4 text-primary transition-colors" />
                    </div>
                    <div className="flex flex-col flex-1 text-left">
                      <span className="font-medium text-sm">Quick Generate</span>
                      <span className="text-xs text-muted-foreground">50+ ready prompts</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${quickGenerateOpen ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-2 rounded-lg border border-border bg-card overflow-hidden" style={{ height: "350px" }}>
                      <QuickGeneratePanel onSelectPrompt={handleQuickPrompt} />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-4 border-t border-border">
        <div className="rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 p-4 border border-primary/20">
          <p className="text-xs text-muted-foreground mb-2">Pro Tip</p>
          <p className="text-sm">Use Quick Generate for instant UI components!</p>
        </div>
      </div>
    </Sidebar>
  );
}

// Quick UI generator
function generateQuickUI(prompt: string) {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes("login") || lowerPrompt.includes("signin")) {
    return {
      html: `<div class="form-container">
  <div class="form-card">
    <h2 class="form-title">Welcome Back</h2>
    <p class="form-subtitle">Sign in to your account</p>
    
    <form class="form">
      <div class="input-group">
        <label for="email">Email</label>
        <input type="email" id="email" placeholder="you@example.com">
      </div>
      
      <div class="input-group">
        <label for="password">Password</label>
        <input type="password" id="password" placeholder="••••••••">
      </div>

      <div class="form-options">
        <label class="checkbox-label">
          <input type="checkbox"> Remember me
        </label>
        <a href="#" class="forgot-link">Forgot password?</a>
      </div>
      
      <button type="submit" class="submit-btn">Sign In</button>
    </form>
  </div>
</div>`,
      css: `.form-container {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.form-card {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
  background: #1e293b;
  border-radius: 1rem;
  border: 1px solid #334155;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.form-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.5rem;
}

.form-subtitle {
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

.forgot-link {
  color: #22d3ee;
  font-size: 0.875rem;
  text-decoration: none;
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
  transition: opacity 0.2s;
}

.submit-btn:hover {
  opacity: 0.9;
}`,
      js: `document.querySelector('.form').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  console.log('Login:', { email, password });
  alert('Login submitted!');
});`
    };
  }

  if (lowerPrompt.includes("pricing") || lowerPrompt.includes("plan")) {
    return {
      html: `<div class="pricing-container">
  <div class="pricing-card popular">
    <div class="popular-badge">Most Popular</div>
    <h3 class="plan-name">Pro Plan</h3>
    <div class="price">
      <span class="currency">$</span>
      <span class="amount">29</span>
      <span class="period">/month</span>
    </div>
    <p class="plan-description">Perfect for growing businesses</p>
    
    <ul class="features-list">
      <li><span class="check">✓</span> Unlimited projects</li>
      <li><span class="check">✓</span> Priority support</li>
      <li><span class="check">✓</span> Advanced analytics</li>
      <li><span class="check">✓</span> Custom integrations</li>
      <li><span class="check">✓</span> Team collaboration</li>
    </ul>
    
    <button class="cta-btn">Get Started</button>
  </div>
</div>`,
      css: `.pricing-container {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.pricing-card {
  width: 100%;
  max-width: 350px;
  padding: 2rem;
  background: #1e293b;
  border-radius: 1.5rem;
  border: 1px solid #334155;
  position: relative;
  text-align: center;
}

.pricing-card.popular {
  border-color: #22d3ee;
  box-shadow: 0 0 40px rgba(34, 211, 238, 0.2);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #22d3ee, #3b82f6);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #0f172a;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin-top: 1rem;
}

.price {
  margin: 1.5rem 0;
}

.currency {
  font-size: 1.5rem;
  color: #22d3ee;
  vertical-align: top;
}

.amount {
  font-size: 4rem;
  font-weight: 800;
  color: #f8fafc;
  line-height: 1;
}

.period {
  color: #64748b;
  font-size: 1rem;
}

.plan-description {
  color: #94a3b8;
  margin-bottom: 2rem;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
  text-align: left;
}

.features-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #334155;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.features-list li:last-child {
  border-bottom: none;
}

.check {
  color: #22d3ee;
  font-weight: bold;
}

.cta-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #22d3ee, #3b82f6);
  border: none;
  border-radius: 0.75rem;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(34, 211, 238, 0.3);
}`,
      js: `document.querySelector('.cta-btn').addEventListener('click', function() {
  alert('Starting Pro Plan subscription!');
});`
    };
  }

  if (lowerPrompt.includes("hero")) {
    return {
      html: `<section class="hero">
  <div class="hero-content">
    <span class="hero-badge">✨ Introducing v2.0</span>
    <h1 class="hero-title">Build amazing products <span class="gradient-text">faster</span></h1>
    <p class="hero-subtitle">The all-in-one platform for modern teams to design, develop, and deploy beautiful applications.</p>
    <div class="hero-buttons">
      <button class="btn-primary">Get Started Free</button>
      <button class="btn-secondary">Watch Demo</button>
    </div>
  </div>
  <div class="hero-visual">
    <div class="hero-card"></div>
  </div>
</section>`,
      css: `.hero {
  min-height: 100%;
  display: flex;
  align-items: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  gap: 4rem;
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(34, 211, 238, 0.1);
  border: 1px solid rgba(34, 211, 238, 0.3);
  border-radius: 9999px;
  color: #22d3ee;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: #f8fafc;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.gradient-text {
  background: linear-gradient(135deg, #22d3ee, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #22d3ee, #3b82f6);
  border: none;
  border-radius: 0.75rem;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(34, 211, 238, 0.3);
}

.btn-secondary {
  padding: 1rem 2rem;
  background: transparent;
  border: 1px solid #334155;
  border-radius: 0.75rem;
  color: #e2e8f0;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #334155;
}

.hero-visual {
  flex: 1;
  display: flex;
  justify-content: center;
}

.hero-card {
  width: 400px;
  height: 300px;
  background: linear-gradient(135deg, #22d3ee 0%, #a855f7 100%);
  border-radius: 1rem;
  opacity: 0.8;
}`,
      js: `document.querySelector('.btn-primary').addEventListener('click', function() {
  alert('Getting started!');
});

document.querySelector('.btn-secondary').addEventListener('click', function() {
  alert('Playing demo video...');
});`
    };
  }

  // Default component
  return {
    html: `<div class="component-container">
  <div class="component-card">
    <div class="card-header">
      <span class="badge">New</span>
      <h3 class="card-title">UI Component</h3>
    </div>
    <p class="card-description">This component was generated based on your prompt. Customize it to match your needs.</p>
    <div class="card-actions">
      <button class="btn-primary">Primary Action</button>
      <button class="btn-secondary">Secondary</button>
    </div>
  </div>
</div>`,
    css: `.component-container {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.component-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: #1e293b;
  border-radius: 1rem;
  border: 1px solid #334155;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #22d3ee, #3b82f6);
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
  background: linear-gradient(135deg, #22d3ee, #3b82f6);
  border: none;
  border-radius: 0.5rem;
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary {
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #e2e8f0;
  cursor: pointer;
}`,
    js: `document.querySelector('.btn-primary').addEventListener('click', function() {
  alert('Primary action clicked!');
});`
  };
}
