import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_PROMPT_LENGTH = 500;
const MAX_EXISTING_CODE_LENGTH = 50000;
const MAX_IMAGES_TO_GENERATE = 4;

function sanitizeInput(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

// Extract image info from HTML: returns array of { src, alt, fullTag }
function extractImages(html: string): Array<{ src: string; alt: string; fullMatch: string }> {
  const imgRegex = /<img\s+[^>]*?src=["']([^"']+)["'][^>]*?>/gi;
  const results: Array<{ src: string; alt: string; fullMatch: string }> = [];
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    const fullMatch = match[0];
    const src = match[1];
    const altMatch = fullMatch.match(/alt=["']([^"']*)["']/i);
    const alt = altMatch ? altMatch[1] : "";
    results.push({ src, alt, fullMatch });
  }

  return results;
}

// Generate a single image using AI
async function generateImage(
  description: string,
  apiKey: string
): Promise<string | null> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: `Generate a clean, professional image for a web UI: ${description}. The image should be high quality, well-lit, and suitable as a web component image. No text overlays.`,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      console.error("Image generation failed:", response.status);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    return imageUrl || null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
}

// Replace placeholder image URLs with AI-generated base64 images
async function replaceImagesWithAI(
  html: string,
  uiContext: string,
  apiKey: string
): Promise<string> {
  const images = extractImages(html);
  if (images.length === 0) return html;

  // Take up to MAX_IMAGES_TO_GENERATE images
  const imagesToProcess = images.slice(0, MAX_IMAGES_TO_GENERATE);

  // Generate all images in parallel
  const generationPromises = imagesToProcess.map((img) => {
    const description = img.alt
      ? `${img.alt} (for a ${uiContext})`
      : `A relevant image for a ${uiContext} web component`;
    return generateImage(description, apiKey);
  });

  const generatedImages = await Promise.all(generationPromises);

  // Replace src URLs with generated base64 data URIs
  let updatedHtml = html;
  for (let i = 0; i < imagesToProcess.length; i++) {
    const base64Url = generatedImages[i];
    if (base64Url) {
      // Replace the src in the specific img tag
      const originalSrc = imagesToProcess[i].src;
      // Only replace the first occurrence of this src to handle duplicates correctly
      updatedHtml = updatedHtml.replace(originalSrc, base64Url);
    }
  }

  return updatedHtml;
}

function buildSystemPrompt(isRefinement: boolean): string {
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
10. For images, use https://picsum.photos/seed/{descriptive-name}/{width}/{height} as temporary placeholders. Use DESCRIPTIVE alt text that accurately describes what the image should show (e.g. alt="Professional headshot of a female software engineer" or alt="Modern minimalist office workspace"). The alt text will be used to generate real images.

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

IMAGE RULES (CRITICAL):
- Use https://picsum.photos/seed/{name}/{width}/{height} as temporary placeholder URLs for images
- Size guidelines: avatars 80x80, profile photos 120x120, card images 400x300, hero banners 1200x600, thumbnails 200x200, product images 600x400
- EVERY <img> tag MUST have a highly descriptive alt attribute that precisely describes the ideal image content
- Examples of GOOD alt text: "Professional headshot of a young woman with brown hair smiling", "Aerial view of a modern city skyline at sunset", "Flat lay of a laptop, coffee cup, and notebook on a wooden desk"
- Examples of BAD alt text: "Image 1", "Photo", "Avatar", "Placeholder"
- The alt text will be used to generate AI images, so make it as descriptive and specific as possible
- Include images generously in cards, profiles, heroes, galleries, and product sections
- Use different seeds for different images to avoid duplicates

Remember: Respond with ONLY the JSON object, nothing else.`;
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
      const codeStr = JSON.stringify(existingCode);
      if (codeStr.length > MAX_EXISTING_CODE_LENGTH) {
        return new Response(
          JSON.stringify({ error: "Existing code payload is too large" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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

    // Step 2: Replace placeholder images with AI-generated images
    console.log("Starting AI image generation for UI...");
    const enhancedHtml = await replaceImagesWithAI(
      uiCode.html,
      sanitizedPrompt,
      LOVABLE_API_KEY
    );
    console.log("Image generation complete");

    return new Response(
      JSON.stringify({
        html: enhancedHtml,
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
