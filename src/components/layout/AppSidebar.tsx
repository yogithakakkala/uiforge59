import { Wand2, Eye, Code2, GraduationCap, Sparkles } from "lucide-react";
import { NavLink } from "@/components/NavLink";
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

const navItems = [
  { title: "Generate", url: "/", icon: Wand2, description: "Create UI from prompts" },
  { title: "Preview", url: "/preview", icon: Eye, description: "View your creation" },
  { title: "Code & Learn", url: "/code", icon: Code2, description: "Explore the code" },
  { title: "AI Tutor", url: "/tutor", icon: GraduationCap, description: "Get guided help" },
];

export function AppSidebar() {
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-4 border-t border-border">
        <div className="rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 p-4 border border-primary/20">
          <p className="text-xs text-muted-foreground mb-2">Pro Tip</p>
          <p className="text-sm">Try "Create a modern login form with social buttons"</p>
        </div>
      </div>
    </Sidebar>
  );
}
