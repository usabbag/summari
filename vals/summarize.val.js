import { OpenAI } from "https://esm.town/v/std/openai";

async function summarizePage(url) {
    const response = await fetch(url);
    const text = await response.text();

    // Initialize OpenAI API using your own API key
    const openai = new OpenAI({
        apiKey: Deno.env.get("OPENAI_API_KEY")
    });

    // Use OpenAI API to summarize the text
    const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: `Summarize the following text: ${text}` }],
        model: "gpt-4o",
        max_tokens: 200,
    });

    return completion.choices[0].message.content;
}

export default async function handleRequest(req) {
    // Get the origin from the request headers
    const origin = req.headers.get('Origin') || '*';

    // Update these headers for your response
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true',
    };

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers });
    }

    const { url } = await req.json();

    try {
        const summary = await summarizePage(url);
        return new Response(JSON.stringify({ summary }), { headers });
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to summarize the page' }), { 
            status: 500, 
            headers 
        });
    }
}