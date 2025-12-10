import Anthropic from '@anthropic-ai/sdk';

async function summarizePage(text, apiKey) {
  // Initialize Anthropic API with the provided API key
  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  // Use Claude API to summarize the text
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
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
  });

  return message.content[0].text;
}

export default {
  async fetch(request, env, ctx) {
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Anthropic-Key",
      "Access-Control-Max-Age": "86400"
    };

    // Handle OPTIONS request for CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers, status: 204 });
    }

    const apiKey = request.headers.get("X-Anthropic-Key");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key required" }), {
        status: 401,
        headers
      });
    }

    // Decrypt the API key if it's in our encrypted format
    let decryptedKey = apiKey;
    if (apiKey.includes('|')) {
      try {
        const [encryptedKey, fingerprint] = apiKey.split('|');
        const decoded = atob(encryptedKey);
        const decoder = new TextDecoder();
        const data = new Uint8Array([...decoded].map(c => c.charCodeAt(0)));
        decryptedKey = decoder.decode(data).replace(fingerprint, '');
      } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid API key format" }), {
          status: 401,
          headers
        });
      }
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers
      });
    }

    const { url, text } = body;

    try {
      let contentToSummarize;

      if (url) {
        // Fetch content from URL
        try {
          const response = await fetch(url);
          contentToSummarize = await response.text();
        } catch (error) {
          console.error("Error fetching URL:", error);
          throw new Error("Failed to fetch URL");
        }
      } else if (text) {
        contentToSummarize = text;
      } else {
        throw new Error("Neither URL nor text provided");
      }

      const summary = await summarizePage(contentToSummarize, decryptedKey);
      return new Response(JSON.stringify({ summary }), { headers, status: 200 });
    } catch (error) {
      console.error("Error:", error);
      return new Response(JSON.stringify({ error: error.message || "Failed to summarize the content" }), {
        status: 500,
        headers,
      });
    }
  }
};
