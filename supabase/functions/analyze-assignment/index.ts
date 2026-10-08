// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This is a Supabase Edge Function to securely process assignment files with Gemini / OpenAI
// without exposing API keys to the frontend React application.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!geminiApiKey && !openAiApiKey) {
      return new Response(
        JSON.stringify({
          error: "AI provider API key (GEMINI_API_KEY or OPENAI_API_KEY) is not configured in Supabase Edge Function environment secrets.",
          isServerKeyRequired: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 503,
        }
      );
    }

    const {
      assignmentTitle,
      subjectName,
      description,
      fileName,
      fileBase64,
      fileMimeType,
    } = await req.json();

    const systemPrompt = `You are an elite academic tutor and study assistant. Analyze the given student assignment, identify the core questions/problems, and provide comprehensive solutions, step-by-step explanations, key concepts, flashcards, and exam revision topics.
Return ONLY valid JSON matching this schema:
{
  "questions": ["string"],
  "solutions": [
    {
      "question": "string",
      "answer": "string",
      "steps": ["string"],
      "finalAnswer": "string"
    }
  ],
  "explanations": [
    {
      "concept": "string",
      "detail": "string",
      "practicalExample": "string"
    }
  ],
  "keyConcepts": ["string"],
  "flashcards": [
    {
      "front": "string",
      "back": "string",
      "topic": "string",
      "difficulty": "easy" | "medium" | "hard"
    }
  ],
  "examTopics": ["string"]
}`;

    if (geminiApiKey) {
      // Call Google Gemini 1.5 Flash
      const parts: any[] = [
        { text: `${systemPrompt}\n\nAssignment: ${assignmentTitle} (${subjectName || 'General'})\nDescription: ${description || 'None'}\nFile: ${fileName || 'None'}` }
      ];

      if (fileBase64 && fileMimeType) {
        parts.push({
          inlineData: {
            mimeType: fileMimeType,
            data: fileBase64,
          },
        });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      const geminiData = await response.json();
      const textOutput = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textOutput) {
        throw new Error("Empty response from Gemini model");
      }

      const parsed = JSON.parse(textOutput);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Fallback: OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Analyze this assignment: ${assignmentTitle} (${subjectName || 'General'})\nDescription: ${description || ''}`,
          },
        ],
      }),
    });

    const openAiData = await response.json();
    const parsed = JSON.parse(openAiData.choices?.[0]?.message?.content || "{}");

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Failed to analyze assignment" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
