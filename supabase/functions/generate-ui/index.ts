import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_PROMPT_LENGTH = 500;
const MAX_EXISTING_CODE_LENGTH = 50000;

// Basic sanitization: strip control characters except newlines/tabs
function sanitizeInput(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Authentication ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Input parsing & validation ---
    const { prompt, existingCode, isRefinement } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Prompt is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sanitizedPrompt = sanitizeInput(prompt.trim());

    if (sanitizedPrompt.length === 0) {
      return new Response(
        JSON.stringify({ error: "Prompt cannot be empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (sanitizedPrompt.length > MAX_PROMPT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate existing code for refinements
    if (isRefinement && existingCode) {
      const codeStr = JSON.stringify(existingCode);
      if (codeStr.length > MAX_EXISTING_CODE_LENGTH) {
        return new Response(
          JSON.stringify({ error: "Existing code payload is too large" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    let systemPrompt: string;
    let userPrompt: string;

    if (isRefinement && existingCode) {
      systemPrompt = `You are an expert UI developer. You will be given existing HTML, CSS, and JavaScript code, and a request to modify it.

IMPORTANT: You must respond with ONLY valid JSON in this exact format (no markdown, no code blocks, no extra text):
{"html":"<your html here>","css":"<your css here>","js":"<your js here>"}

Rules:
1. Modify the existing code based on the user's request
2. Keep the overall structure intact unless explicitly asked to change it
3. Apply the requested changes precisely
4. Maintain consistency with the existing design unless asked otherwise
5. Ensure responsive design is preserved
6. Use vanilla JavaScript for interactivity
7. Escape all quotes and special characters properly in the JSON strings
8. NEVER generate code that attempts to access parent frames, cookies, localStorage, or make external network requests
9. NEVER include inline event handlers that reference external URLs
10. For images, ALWAYS use https://picsum.photos for placeholder images (e.g. https://picsum.photos/400/300, https://picsum.photos/seed/unique-name/400/300 for deterministic images). NEVER use broken image links.

Remember: Respond with ONLY the JSON object, nothing else.`;

      userPrompt = `Here is the existing code:

HTML:
${existingCode.html}

CSS:
${existingCode.css}

JavaScript:
${existingCode.js || "// No JavaScript"}

Please apply these changes: ${sanitizedPrompt}`;
    } else {
      systemPrompt = `You are an expert UI developer. Generate clean, modern, and responsive UI components using HTML, CSS, and JavaScript.

IMPORTANT: You must respond with ONLY valid JSON in this exact format (no markdown, no code blocks, no extra text):
{"html":"<your html here>","css":"<your css here>","js":"<your js here>"}

Rules:
1. Generate complete, working UI components
2. Use modern CSS with flexbox/grid
3. Use a dark theme with these colors: background #0f172a, cards #1e293b, borders #334155, text #f8fafc, muted #94a3b8, accent #22d3ee
4. Add hover effects and smooth transitions
5. Make it responsive
6. Include meaningful placeholder content
7. Use vanilla JavaScript for interactivity
8. Escape all quotes and special characters properly in the JSON strings
9. The CSS should work standalone (no external dependencies)
10. The HTML should be a complete component that fills the container
11. NEVER generate code that attempts to access parent frames, cookies, localStorage, or make external network requests
12. NEVER include inline event handlers that reference external URLs

IMAGE RULES (CRITICAL):
- ALWAYS use https://picsum.photos for ALL images. This is the ONLY allowed image source.
- Use deterministic seeds for consistent images: https://picsum.photos/seed/{descriptive-name}/{width}/{height}
- Choose seeds that describe the image context (e.g. seed/team-member-1, seed/product-laptop, seed/hero-sunset, seed/avatar-jane)
- Size guidelines: avatars 80x80, profile photos 120x120, card images 400x300, hero banners 1200x600, thumbnails 200x200, product images 600x400, backgrounds 1920x1080
- Use images GENEROUSLY - every card, profile, hero, product section, and gallery MUST have images
- For team/people sections: use different seeds per person (seed/person-1, seed/person-2, etc.)
- For product/portfolio: use contextual seeds (seed/product-shoes, seed/portfolio-web-1, etc.)
- NEVER use placeholder.com, via.placeholder.com, or any other image service
- NEVER leave broken image links - every <img> must have a working picsum.photos URL

Remember: Respond with ONLY the JSON object, nothing else.`;

      userPrompt = `Generate a visually rich UI component for: ${sanitizedPrompt}. Include relevant placeholder images where appropriate to make it look realistic and complete.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    // Parse the JSON response
    let uiCode;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        uiCode = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    if (!uiCode.html || !uiCode.css) {
      throw new Error("Invalid UI code structure");
    }

    return new Response(
      JSON.stringify({
        html: uiCode.html,
        css: uiCode.css,
        js: uiCode.js || "",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating UI:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate UI" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
