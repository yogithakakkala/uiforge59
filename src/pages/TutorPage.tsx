import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestedQuestions = [
  "How do I center a div?",
  "Explain CSS flexbox",
  "What is semantic HTML?",
  "How do event listeners work?",
];

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI Tutor for web development. Ask me anything about HTML, CSS, JavaScript, or any UI concepts. I'm here to help you learn! 🚀",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Simulate AI response (replace with actual AI later)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const response = generateMockResponse(userMessage);
    setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    setIsLoading(false);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="flex-1 flex flex-col p-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Bot className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">AI Tutor</h1>
          <p className="text-sm text-muted-foreground">
            Your personal web development mentor
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 rounded-lg border border-border bg-card overflow-hidden flex flex-col animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                } animate-slide-in`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-xl p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">
              Try asking:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="px-3 py-1.5 rounded-full bg-secondary text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about web development..."
              className="flex-1 bg-secondary border-0"
              disabled={isLoading}
            />
            <Button type="submit" disabled={!input.trim() || isLoading} variant="glow">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Mock response generator (replace with actual AI later)
function generateMockResponse(question: string): string {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes("center") && lowerQuestion.includes("div")) {
    return `Great question! There are several ways to center a div:

**1. Flexbox (Most Common)**
\`\`\`css
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}
\`\`\`

**2. CSS Grid**
\`\`\`css
.parent {
  display: grid;
  place-items: center;
}
\`\`\`

**3. Absolute Positioning**
\`\`\`css
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
\`\`\`

I recommend using Flexbox for most cases as it's widely supported and easy to understand!`;
  }

  if (lowerQuestion.includes("flexbox")) {
    return `**CSS Flexbox** is a one-dimensional layout method for arranging items in rows or columns.

**Key Properties:**

📦 **Container (Parent):**
- \`display: flex\` - Enables flexbox
- \`justify-content\` - Horizontal alignment
- \`align-items\` - Vertical alignment
- \`flex-direction\` - Row or column layout
- \`gap\` - Space between items

📦 **Items (Children):**
- \`flex-grow\` - How much item should grow
- \`flex-shrink\` - How much item should shrink
- \`flex-basis\` - Initial size of item

Would you like me to show you some practical examples?`;
  }

  if (lowerQuestion.includes("semantic")) {
    return `**Semantic HTML** uses elements that clearly describe their meaning to both the browser and developer.

**Common Semantic Elements:**
- \`<header>\` - Page or section header
- \`<nav>\` - Navigation links
- \`<main>\` - Main content of the page
- \`<article>\` - Self-contained content
- \`<section>\` - Grouped related content
- \`<aside>\` - Sidebar content
- \`<footer>\` - Page or section footer

**Benefits:**
✅ Better accessibility for screen readers
✅ Improved SEO
✅ Cleaner, more readable code
✅ Easier maintenance

Instead of \`<div class="header">\`, use \`<header>\`!`;
  }

  if (lowerQuestion.includes("event") && lowerQuestion.includes("listener")) {
    return `**Event Listeners** allow JavaScript to respond to user interactions.

**Basic Syntax:**
\`\`\`javascript
element.addEventListener('click', function() {
  // Do something when clicked
});
\`\`\`

**Common Events:**
- \`click\` - Mouse click
- \`submit\` - Form submission
- \`keydown\` - Key pressed
- \`mouseover\` - Mouse enters element
- \`change\` - Input value changes

**Example:**
\`\`\`javascript
const button = document.querySelector('.my-button');
button.addEventListener('click', () => {
  alert('Button clicked!');
});
\`\`\`

Pro tip: Use \`removeEventListener\` to clean up when needed!`;
  }

  return `That's an interesting question! Let me help you with that.

Based on your question about "${question}", here are some key points:

1. **Understanding the Concept**: This is a fundamental topic in web development that's worth mastering.

2. **Best Practices**: Always follow modern standards and write clean, maintainable code.

3. **Resources**: I recommend checking out MDN Web Docs for detailed documentation.

Would you like me to explain any specific aspect in more detail? Feel free to ask follow-up questions!`;
}
