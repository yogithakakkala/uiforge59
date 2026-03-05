import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wand2, Lock, User, Loader2, Sparkles, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) return;

    setIsLoading(true);
    const { error } = await signIn(loginUsername, loginPassword, rememberMe);
    setIsLoading(false);

    if (error) {
      toast.error("Invalid username or password");
    } else {
      toast.success("Welcome back!");
      navigate("/");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupUsername || !signupPassword) return;

    if (signupPassword !== signupConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(signupUsername, signupPassword);
    setIsLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Username already taken");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Account created! Signing you in...");
      const { error: signInError } = await signIn(signupUsername, signupPassword);
      if (!signInError) {
        navigate("/");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-[350px] h-[350px] rounded-full bg-primary/8 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[15%] right-[10%] w-[300px] h-[300px] rounded-full bg-accent/8 blur-[120px] animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[150px]" />
      </div>

      {/* Logo/Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="p-3 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-sm"
          >
            <Wand2 className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-4xl font-bold gradient-text">UI Forge</h1>
        </div>
        <p className="text-muted-foreground text-lg">AI-Powered UI Component Generator</p>
      </motion.div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-border/30 bg-card/60 backdrop-blur-xl shadow-2xl shadow-primary/5">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="login" className="data-[state=active]:shadow-sm">Login</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="Enter your username"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary/50"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <Label htmlFor="remember-me" className="text-sm font-normal cursor-pointer">
                      Remember me
                    </Label>
                  </div>
                  <Button type="submit" className="w-full" variant="glow" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="Choose a username"
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and underscores only</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary/50"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
                        minLength={6}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" variant="glow" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </motion.div>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 flex flex-wrap justify-center gap-2 text-xs relative z-10"
      >
        {["✨ AI-Powered", "📱 Responsive", "⚡ Instant", "📥 Downloadable"].map((tag, i) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + i * 0.08 }}
            className="px-3 py-1.5 rounded-full bg-card/50 backdrop-blur-sm border border-border/30 text-muted-foreground"
          >
            {tag}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
