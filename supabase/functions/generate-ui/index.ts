import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_PROMPT_LENGTH = 1000;
const MAX_EXISTING_CODE_LENGTH = 500000;
const MAX_AI_IMAGES = 3;

function sanitizeInput(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

function buildSystemPrompt(isRefinement: boolean): string {
  const imageRules = `
IMAGE RULES (MANDATORY):
- For images, use placeholder URLs in this exact format: https://placeholder.img/{index}
  where {index} is 1, 2, 3, etc. Use at most ${MAX_AI_IMAGES} images.
- Each <img> tag MUST have a highly descriptive alt text that describes EXACTLY what the image should show.
  Example: alt="A smiling female doctor in a white lab coat with a stethoscope, standing in a modern clinic"
  Example: alt="A plate of fresh sushi rolls with wasabi and ginger on a dark wooden table"
  Example: alt="A sleek black sports car parked on a mountain road at sunset"
- The alt text is CRITICAL — it will be used to generate the actual image. Be specific about:
  subject, setting, lighting, colors, mood, style.
- Size the images appropriately: avatars 80x80, cards 400x300, heroes 1200x600, products 600x400.`;

  if (isRefinement) {
    return `You are an expert UI developer. You will be given existing HTML, CSS, and JavaScript code, and a request to modify it.

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
${imageRules}

Remember: Respond with ONLY the JSON object, nothing else.`;
  }

  return `You are an expert UI developer. Generate clean, modern, and responsive UI components using HTML, CSS, and JavaScript.

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
${imageRules}

Remember: Respond with ONLY the JSON object, nothing else.`;
}

// Extract placeholder image URLs and their alt texts from HTML
function extractImagePlaceholders(html: string): { placeholder: string; alt: string }[] {
  const results: { placeholder: string; alt: string }[] = [];
  const imgRegex = /<img[^>]*src=["'](https:\/\/placeholder\.img\/\d+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    const altMatch = match[0].match(/alt=["']([^"']*)["']/i);
    const alt = altMatch?.[1] || "A relevant image";
    if (results.length < MAX_AI_IMAGES) {
      results.push({ placeholder: src, alt });
    }
  }
  // Also check for src after alt
  const imgRegex2 = /<img[^>]*alt=["']([^"']*)["'][^>]*src=["'](https:\/\/placeholder\.img\/\d+)["'][^>]*>/gi;
  while ((match = imgRegex2.exec(html)) !== null) {
    const src = match[2];
    const alt = match[1] || "A relevant image";
    if (!results.find(r => r.placeholder === src) && results.length < MAX_AI_IMAGES) {
      results.push({ placeholder: src, alt });
    }
  }
  return results;
}

// Generate a single image using nano banana
async function generateImage(alt: string, apiKey: string): Promise<string | null> {
  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: `Generate a high-quality, photorealistic image: ${alt}. Make it vivid and professional.` }],
        modalities: ["image", "text"],
      }),
    });
    if (!resp.ok) {
      console.error("Image gen failed:", resp.status);
      return null;
    }
    const data = await resp.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    return imageUrl || null;
  } catch (e) {
    console.error("Image gen error:", e);
    return null;
  }
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

    if (isRefinement && existingCode) {
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
      userPrompt = `Generate a visually rich UI component for: ${sanitizedPrompt}. Include relevant images with highly descriptive alt text where appropriate.`;
    }

    // Step 1: Generate UI code
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
    } catch (_parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    if (!uiCode.html || !uiCode.css) {
      throw new Error("Invalid UI code structure");
    }

    // Step 2: Extract placeholders and generate images in parallel
    const placeholders = extractImagePlaceholders(uiCode.html);
    
    if (placeholders.length > 0) {
      const imagePromises = placeholders.map(p => generateImage(p.alt, LOVABLE_API_KEY));
      const images = await Promise.all(imagePromises);

      // Replace placeholders with generated base64 images
      for (let i = 0; i < placeholders.length; i++) {
        const img = images[i];
        if (img) {
          uiCode.html = uiCode.html.replaceAll(placeholders[i].placeholder, img);
        }
      }
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
