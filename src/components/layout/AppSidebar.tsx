import { useState } from "react";
import { Wand2, Eye, Code2, GraduationCap, Sparkles, Zap, ChevronDown, History, FlaskConical } from "lucide-react";
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
import { generateUI } from "@/lib/generateUI";
import { toast } from "sonner";

const navItems = [
  { title: "Generate", url: "/", icon: Wand2, description: "Create UI from prompts" },
  { title: "Preview", url: "/preview", icon: Eye, description: "View your creation" },
  { title: "Code & Learn", url: "/code", icon: Code2, description: "Explore the code" },
  { title: "AI Tutor", url: "/tutor", icon: GraduationCap, description: "Get guided help" },
  { title: "History", url: "/history", icon: History, description: "Past generations" },
  { title: "Practice", url: "/practice", icon: FlaskConical, description: "Code playground" },
];

export function AppSidebar() {
  const [quickGenerateOpen, setQuickGenerateOpen] = useState(false);
  const navigate = useNavigate();
  const { setGeneratedUI, setIsGenerating, addToHistory } = useUIStore();

  const handleQuickPrompt = async (prompt: string) => {
    setQuickGenerateOpen(false);
    navigate("/");
    
    setIsGenerating(true);
    try {
      const generatedCode = await generateUI(prompt);
      const uiData = {
        ...generatedCode,
        prompt,
        timestamp: Date.now(),
      };
      setGeneratedUI(uiData);
      addToHistory(uiData);
      toast.success("UI generated successfully!");
      navigate("/preview");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate UI");
    } finally {
      setIsGenerating(false);
    }
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
