import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_PROMPT_LENGTH = 1000;
const MAX_EXISTING_CODE_LENGTH = 500000;

function sanitizeInput(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

function buildSystemPrompt(isRefinement: boolean): string {
  if (isRefinement) {
    return `Modify HTML/CSS/JS. Return ONLY: {"html":"...","css":"...","js":"..."}. Keep it short. Dark theme: bg #0f172a, cards #1e293b, text #f8fafc, accent #22d3ee.`;
  }
  return `Generate a UI component. Return ONLY: {"html":"...","css":"...","js":"..."}. Keep code minimal and concise. Dark theme (bg #0f172a, cards #1e293b, text #f8fafc, accent #22d3ee). CSS only, no images, no external deps.`;
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

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
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

    if (isRefinement && existingCode) {
      // Strip base64 data URIs before size check (AI images inflate payload)
      const stripBase64 = (s: string) => s ? s.replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g, 'PLACEHOLDER_IMG') : '';
      const strippedCode = JSON.stringify({
        html: stripBase64(existingCode.html || ''),
        css: existingCode.css || '',
        js: existingCode.js || '',
      });
      if (strippedCode.length > MAX_EXISTING_CODE_LENGTH) {
        return new Response(
          JSON.stringify({ error: "Existing code payload is too large" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      // Also strip base64 from the actual code sent to AI to save tokens
      existingCode.html = stripBase64(existingCode.html || '');
    }

    const systemPrompt = buildSystemPrompt(!!isRefinement && !!existingCode);
    let userPrompt: string;

    if (isRefinement && existingCode) {
      userPrompt = `Here is the existing code:

HTML:
${existingCode.html}

CSS:
${existingCode.css}

JavaScript:
${existingCode.js || "// No JavaScript"}

Please apply these changes: ${sanitizedPrompt}`;
    } else {
      userPrompt = `Create: ${sanitizedPrompt}. No images unless essential.`;
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
        temperature: 0.2,
        max_tokens: 4000,
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
    } catch (_parseError) {
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
