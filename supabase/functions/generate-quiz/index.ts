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
    const {
      content,
      numQuestions,
      difficulty,
      questionType,
      topic,
      language,
    } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No content provided" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("VITE_GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("VITE_GEMINI_API_KEY is not configured");
    }

    const prompt = `
You are QuizBot AI, an intelligent study assistant.

Analyze the following study material and return ONLY valid JSON.

Generate:
1. summary
2. keyPoints
3. topics
4. formulas
5. questions
6. strengthsHint
7. weakTopicsHint

Rules:
- summary: short easy-to-understand explanation
- keyPoints: important bullet points
- topics: all main topics in the notes
- formulas: all formulas found. If none, return []
- Generate exactly ${numQuestions || 5} quiz questions
- Difficulty: ${difficulty || "Medium"}
- Question Type: ${questionType || "MCQ"}
- Topic Preference: ${topic || "General"}
- Language: ${language || "English"}

Question format:
{
  "question": "...",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": "...",
  "explanation": "...",
  "topic": "..."
}

Return this exact JSON structure:
{
  "summary": "...",
  "keyPoints": ["..."],
  "topics": ["..."],
  "formulas": ["..."],
  "strengthsHint": ["..."],
  "weakTopicsHint": ["..."],
  "questions": [ ... ]
}

Study Material:
${content}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error: ${errorText}`);
    }

    const data = await response.json();

    const rawText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!rawText) {
      throw new Error("No response received from Gemini");
    }

    let parsed;

    try {
      parsed = JSON.parse(rawText);
    } catch {
      const cleaned = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleaned);
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("generate-quiz error:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});