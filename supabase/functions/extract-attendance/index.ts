import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const FUNCTION_VERSION = "2026-02-25-cors-hardened-v3";

function buildCorsHeaders(req: Request) {
  const requestedHeaders = req.headers.get("access-control-request-headers") || "";
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": requestedHeaders ||
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

serve(async (req) => {
  const cors = buildCorsHeaders(req);

  if (req.method === "OPTIONS") {
    console.log(`[extract-attendance] PREFLIGHT origin=${req.headers.get("origin")} headers=${req.headers.get("access-control-request-headers")}`);
    return new Response("ok", { headers: cors });
  }

  console.log(`[extract-attendance] version=${FUNCTION_VERSION} method=${req.method} origin=${req.headers.get("origin")}`);

  try {
    const body = await req.json();
    const { imageBase64, mimeType: rawMime, textContent } = body;

    console.log(`[extract-attendance] input: hasImage=${!!imageBase64}, hasText=${!!textContent}`);

    if (!imageBase64 && !textContent) {
      return new Response(JSON.stringify({ error: "No image or text provided. Please upload an image or .txt file." }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    if (textContent && (typeof textContent !== "string" || textContent.trim().length === 0)) {
      return new Response(JSON.stringify({ error: "Text content is empty. Please upload a valid .txt file." }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userContent: any[] = [];
    if (textContent) {
      userContent.push({
        type: "text",
        text: `Extract the attendance data from this text. For each subject, extract the subject code, subject name, classes present (attended), total classes conducted, and attendance percentage. Return using the extract_attendance tool.\n\nText data:\n${textContent}`,
      });
    } else {
      const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
      const mimeType = allowedMimes.includes(rawMime) ? rawMime : "image/jpeg";
      userContent.push({
        type: "text",
        text: "Extract the attendance data from this image. For each subject, extract the subject code, subject name, classes present (attended), total classes conducted, and attendance percentage. Return using the extract_attendance tool.",
      });
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${imageBase64}` },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: "You are an OCR extraction expert. Extract the attendance data from the provided input. Return structured data using the provided tool." },
          { role: "user", content: userContent },
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_attendance",
            description: "Return the extracted attendance data",
            parameters: {
              type: "object",
              properties: {
                subjects: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      code: { type: "string", description: "Subject code" },
                      name: { type: "string", description: "Subject name" },
                      present: { type: "number", description: "Classes attended" },
                      total: { type: "number", description: "Total classes conducted" },
                      percentage: { type: "number", description: "Attendance percentage" },
                    },
                    required: ["code", "name", "present", "total", "percentage"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["subjects"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "extract_attendance" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 400 && errText.includes("Unable to process input image")) {
        return new Response(JSON.stringify({ error: "This image could not be read. Try a clearer screenshot or crop tightly around the attendance data." }), {
          status: 400, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const args = JSON.parse(toolCall.function.arguments);
    console.log(`[extract-attendance] success, subjects=${args.subjects.length}`);
    return new Response(JSON.stringify(args.subjects), {
      headers: { ...cors, "Content-Type": "application/json", "X-Function-Version": FUNCTION_VERSION },
    });
  } catch (e) {
    console.error("extract-attendance error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
