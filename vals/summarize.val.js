import { OpenAI } from "https://esm.town/v/std/openai";

async function summarizePage(input, isUrl = true) {
    let text;
    if (isUrl) {
        try {
            const response = await fetch(input);
            text = await response.text();
        } catch (error) {
            console.error('Error fetching URL:', error);
            throw new Error('Failed to fetch URL');
        }
    } else {
        text = input;
    }

    // Initialize OpenAI API using your own API key
    const openai = new OpenAI({
        apiKey: Deno.env.get("OPENAI_API_KEY")
    });

    // Use OpenAI API to summarize the text
    const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: `Can you provide a comprehensive summary of the given text? The summary should cover all the key points and main ideas presented in the original text, while also condensing the information into a concise and easy-to-understand format. Keep figures, numbers, and other salient points to make this summary alive and not boring. Please ensure that the summary includes relevant details and examples that support the main ideas, while avoiding any unnecessary information or repetition. The length of the summary should not be above 200 words. : ${text}` }],
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

    const { url, text } = await req.json();

    try {
        let summary;
        if (url) {
            summary = await summarizePage(url);
        } else if (text) {
            summary = await summarizePage(text, false);
        } else {
            throw new Error('Neither URL nor text provided');
        }
        return new Response(JSON.stringify({ summary }), { headers });
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to summarize the content' }), { 
            status: 500, 
            headers 
        });
    }
}