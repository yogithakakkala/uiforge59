import { supabase } from "@/integrations/supabase/client";

export interface GeneratedUICode {
  html: string;
  css: string;
  js: string;
}

export async function generateUI(prompt: string): Promise<GeneratedUICode> {
  const { data, error } = await supabase.functions.invoke("generate-ui", {
    body: { prompt },
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error(error.message || "Failed to generate UI");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return {
    html: data.html,
    css: data.css,
    js: data.js || "",
  };
}

export async function refineUI(
  existingCode: GeneratedUICode,
  refinementPrompt: string
): Promise<GeneratedUICode> {
  const { data, error } = await supabase.functions.invoke("generate-ui", {
    body: {
      prompt: refinementPrompt,
      existingCode,
      isRefinement: true,
    },
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error(error.message || "Failed to refine UI");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return {
    html: data.html,
    css: data.css,
    js: data.js || "",
  };
}
