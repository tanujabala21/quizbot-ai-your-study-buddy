import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, topic, language } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are QuizBot AI, a study assistant. Analyze the provided content and generate a comprehensive study overview.
${topic ? `Focus on the topic: ${topic}.` : ""}
Generate in ${language || "English"}.

You MUST respond using the generate_study_overview tool.`;

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
          { role: "user", content: `Analyze this content and create a study overview:\n\n${content}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_study_overview",
              description: "Generate a study overview from content",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string", description: "Full summary in simple language" },
                  key_points: { type: "array", items: { type: "string" }, description: "Key bullet points" },
                  topics_covered: { type: "array", items: { type: "string" }, description: "Major topics" },
                  formulas: { type: "array", items: { type: "object", properties: { name: { type: "string" }, formula: { type: "string" }, description: { type: "string" } }, required: ["name", "formula"], additionalProperties: false }, description: "Important formulas (empty array if none)" },
                  definitions: { type: "array", items: { type: "object", properties: { term: { type: "string" }, definition: { type: "string" } }, required: ["term", "definition"], additionalProperties: false }, description: "Important definitions" },
                  topics_to_revise: { type: "array", items: { type: "string" }, description: "Important topics to revise" },
                  estimated_difficulty: { type: "string", enum: ["easy", "medium", "hard"], description: "Estimated difficulty level" },
                },
                required: ["summary", "key_points", "topics_covered", "formulas", "definitions", "topics_to_revise", "estimated_difficulty"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_study_overview" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      throw new Error("Failed to generate study overview");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No overview generated");

    const overview = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(overview), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("study-overview error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
