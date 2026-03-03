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
  const imageRules = `
IMAGE RULES (MANDATORY — follow exactly):
- For ALL images, use this URL pattern: https://images.unsplash.com/photo-{id}?w={width}&h={height}&fit=crop&auto=format
- You MUST select photo IDs ONLY from the list below. Pick the ID whose category EXACTLY matches the image's visible subject:

  DOCTORS/MEDICAL STAFF: 1559839734-2b71ea197ec2, 1612349317150-e413f6a5b16d, 1622253694242-abeb37a33b97
  HOSPITAL/CLINIC: 1519494026892-80bbd2d6fd0d, 1516549655169-df83a0774514, 1538108149393-fbbd81895907
  MEDICAL EQUIPMENT: 1581595220892-b0739db3ba8c, 1530497610245-94d3c16cda28, 1551076805-e1869033e561
  MALE PROFESSIONAL: 1507003211169-0a1dd7228f2d, 1472099645785-5658abf4ff4e, 1560250097-0b93528c311a, 1500648767791-00dcc994a43e
  FEMALE PROFESSIONAL: 1494790108377-be9c29b29330, 1438761681033-6461ffad8d80, 1573496359142-b8d87734a5a2, 1580489944761-15a19d654956
  TEAM/GROUP: 1522071820081-009f0129c71c, 1600880292203-757bb62b4baf, 1552664730-d307ca884978
  LAPTOP/CODING: 1498050108023-c5249f4df085, 1517694712202-14dd9538aa97, 1461749280684-dccba630e2f6
  SMARTPHONE/DEVICE: 1531297484001-80022131f5a1, 1504384308090-c894fdcc538d, 1519389950473-47ba0277781c
  FOOD/DISHES: 1504674900247-0877df9cc836, 1414235077428-338989a2e8c0, 1555396273-367ea4eb4db5, 1567620905862-fe4f39cdb0e0
  COFFEE/DRINKS: 1509042239860-f550ce710b93, 1495474472287-4d71bcdd2085, 1517248135467-4c7edcad34c4
  MOUNTAINS: 1506744038136-46273834b3fb, 1464822759023-fed622ff2c3b
  OCEAN/BEACH: 1507525428034-b723cf961d3e, 1505228395891-9a51e7e86bf6
  FOREST: 1441974231531-c6227db76b6e, 1470071459604-3b5ec3a7fe05
  OFFICE/WORKSPACE: 1460925895917-afdab827c52f, 1497366216548-37526070297c, 1497366811353-6870744d04b2
  CHARTS/ANALYTICS: 1553484771-047a44eee27a, 1454165804606-c3d57bc86b40, 1551288049-bebda4e38f71
  FASHION/CLOTHING: 1523275335684-37898b6baf30, 1491553895911-0055eca6402d, 1558171813-4c2ab6e9235c
  ELECTRONICS: 1505740420928-5e560c06d30e, 1526170375885-4d8ecf77b99f
  FITNESS/GYM: 1571019613454-1cb2f99b2d8b, 1517836357463-d25dfeac3438, 1534438327276-14e5300c3a48
  INTERIOR/HOME: 1502672260266-1c1ef2d93688, 1586023492125-27b2c045efd7, 1618221195710-dd6b41faaea6
  EDUCATION/LEARNING: 1503676260728-1c00da094a0b, 1524995997946-a1c6e315a68d, 1523050854058-8df90110c9f1
  TRAVEL/ADVENTURE: 1488646953014-85cb44e25828, 1476514525535-07fb3b4ae5f1, 1469854523086-cc02fe5d8800
  CAR/AUTOMOTIVE: 1494976388531-d1058494cdd8, 1503376780353-7e6692767b70, 1552519507-da3b142c6e3b
  PETS/ANIMALS: 1587300003388-59208cc962cb, 1548199973-03cce0bbc87b, 1425082661705-1834bfd09dca
  MUSIC/CONCERT: 1511671782779-c97d3d27a1d4, 1514320291840-2e0a9bf2a9ae
  BABY/CHILDREN: 1519340241574-2cec6aef0c01, 1503454537195-1dcabb73ffb9

- SIZE: avatars ?w=80&h=80, cards ?w=400&h=300, heroes ?w=1200&h=600, thumbnails ?w=200&h=200, products ?w=600&h=400
- NEVER repeat the same photo ID on a page
- CRITICAL: A doctor profile MUST use DOCTORS/MEDICAL STAFF IDs. A dashboard hero about health MUST use HOSPITAL/CLINIC. Match the VISIBLE SUBJECT, not the page topic.`;

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
