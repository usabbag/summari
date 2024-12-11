import { OpenAI } from "https://esm.town/v/std/openai";

async function summarizePage(input, isUrl = true) {
  let text;
  if (isUrl) {
    try {
      const response = await fetch(input);
      text = await response.text();
    } catch (error) {
      console.error("Error fetching URL:", error);
      throw new Error("Failed to fetch URL");
    }
  } else {
    text = input;
  }

  // Initialize OpenAI API using your own API key
  const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
  });

  // Use OpenAI API to summarize the text
  const completion = await openai.chat.completions.create({
    messages: [{
      role: "user",
      content:
        `You are an expert summarizer tasked with creating concise, engaging, and informative summaries of various texts. Your goal is to distill the essence of the given text while maintaining its key points and making it interesting to read.

Please follow these steps to create a comprehensive summary:

1. Read the text carefully and identify the key points, main ideas, and any important figures or statistics.

2. Condense the information into a concise and easy-to-understand format, keeping the summary under 200 words.

3. Structure your summary as follows:
   A key paragraph (4-5 lines) containing the main ideas, figures, and insights in a dense, information-rich way. 

4. Ensure that your summary is written in an active and engaging style, avoiding dry or overly descriptive language.

5. Include relevant details and examples that support the main ideas, while avoiding unnecessary information or repetition.

Remember to keep the summary under 200 words. Here is the text you need to summarize : ${text}`,
    }],
    model: "gpt-4o",
    max_tokens: 10000,
  });

  return completion.choices[0].message.content;
}

export default async function handleRequest(req) {
  const origin = req.headers.get("Origin") || "*";

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-OpenAI-Key",
    "Access-Control-Max-Age": "86400"
  };

  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers, status: 200 });
  }

  const apiKey = req.headers.get("X-OpenAI-Key");

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key required" }), {
      status: 401,
      headers
    });
  }

  const { url, text } = await req.json();

  try {
    let summary;
    if (url) {
      summary = await summarizePage(url);
    } else if (text) {
      summary = await summarizePage(text, false);
    } else {
      throw new Error("Neither URL nor text provided");
    }
    return new Response(JSON.stringify({ summary }), { headers, status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to summarize the content" }), {
      status: 500,
      headers,
    });
  }
}