import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, existingCode, isRefinement } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!prompt || typeof prompt !== "string") {
      throw new Error("Prompt is required");
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

Remember: Respond with ONLY the JSON object, nothing else.`;

      userPrompt = `Here is the existing code:

HTML:
${existingCode.html}

CSS:
${existingCode.css}

JavaScript:
${existingCode.js || "// No JavaScript"}

Please apply these changes: ${prompt}`;
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

Remember: Respond with ONLY the JSON object, nothing else.`;

      userPrompt = `Generate a UI component for: ${prompt}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
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
      // Try to extract JSON from the response (in case AI added extra text)
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

    // Validate the response structure
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
