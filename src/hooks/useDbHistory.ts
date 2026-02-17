import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUIStore } from "@/store/uiStore";
import { useAuth } from "@/hooks/useAuth";

export function useDbHistory() {
  const { user } = useAuth();
  const { history, addToHistory, clearHistory } = useUIStore();

  // Load history from DB on login
  useEffect(() => {
    if (!user) return;

    const loadHistory = async () => {
      const { data, error } = await supabase
        .from("ui_generations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Failed to load history:", error);
        return;
      }

      if (data && data.length > 0) {
        // Clear local history and replace with DB history
        clearHistory();
        // Add in reverse so newest ends up first
        for (const row of data.reverse()) {
          addToHistory({
            html: row.html || "",
            css: row.css || "",
            js: row.js || "",
            prompt: row.prompt,
            timestamp: new Date(row.created_at).getTime(),
          });
        }
      }
    };

    loadHistory();
  }, [user]);

  // Save a generation to DB
  const saveToDb = useCallback(
    async (gen: { html: string; css: string; js: string; prompt: string }) => {
      if (!user) return;

      const { error } = await supabase.from("ui_generations").insert({
        user_id: user.id,
        prompt: gen.prompt,
        html: gen.html,
        css: gen.css,
        js: gen.js,
      });

      if (error) {
        console.error("Failed to save generation:", error);
      }
    },
    [user]
  );

  // Delete from DB by prompt+timestamp (best effort match)
  const deleteFromDb = useCallback(
    async (prompt: string) => {
      if (!user) return;

      const { error } = await supabase
        .from("ui_generations")
        .delete()
        .eq("user_id", user.id)
        .eq("prompt", prompt)
        .limit(1);

      if (error) {
        console.error("Failed to delete generation:", error);
      }
    },
    [user]
  );

  const clearDb = useCallback(async () => {
    if (!user) return;

    const { error } = await supabase
      .from("ui_generations")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to clear history:", error);
    }
  }, [user]);

  return { saveToDb, deleteFromDb, clearDb };
}
