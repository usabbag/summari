No, you can actually incorporate the setup logic into your existing `summarize.val.js` by adding a new endpoint handler. Here's how:

import { OpenAI } from "https://esm.town/v/std/openai";

// Keep your existing summarizePage function
async function summarizePage(input, isUrl = true) {
    // ... existing code ...
}

// Add function to validate OpenAI key
async function validateOpenAIKey(apiKey) {
    try {
        const openai = new OpenAI({ apiKey });
        const response = await openai.models.list();
        return { valid: true };
    } catch (error) {
        return { 
            valid: false, 
            error: error.message 
        };
    }
}

// Generate bookmarklet code
function generateBookmarklet(apiKey) {
    // Note: This is a simplified version. In production, use proper encryption
    const encodedKey = btoa(apiKey);
    return `javascript:(function(){
        const ENCODED_KEY="${encodedKey}";
        const API_KEY=atob(ENCODED_KEY);
        
        function getPageUrl(){return window.location.href}
        function getPageText(){return document.body.innerText}
        
        function showLoader(){
            const loader=document.createElement("div");
            loader.id="summaryLoader";
            loader.style.cssText="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background-color:rgba(0,0,0,0.7);color:white;padding:20px;border-radius:10px;z-index:10001;font-family:Arial,sans-serif;";
            loader.textContent="Summarizing...";
            document.body.appendChild(loader)
        }
        
        function hideLoader(){
            const loader=document.getElementById("summaryLoader");
            if(loader){document.body.removeChild(loader)}
        }
        
        function showModal(summary,source){
            if(!document.getElementById("summaryModal")){
                const modal=document.createElement("div");
                modal.id="summaryModal";
                modal.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000;";
                const content=document.createElement("div");
                content.style.cssText="background-color:#fff;padding:20px;border-radius:8px;max-width:80%;max-height:80%;overflow-y:auto;";
                content.innerHTML=\`<h2>Page Summary</h2><p><strong>Source: \${source}</strong></p><p>\${summary}</p><button id="closeModal">Close</button>\`;
                modal.appendChild(content);
                document.body.appendChild(modal);
                document.getElementById("closeModal").addEventListener("click",()=>{document.body.removeChild(modal)})
            }
        }
        
        async function getSummary(url,text){
            const response=await fetch("https://ulysse-bookmarkdigest.web.val.run",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "X-OpenAI-Key":API_KEY
                },
                body:JSON.stringify({url,text}),
                mode:"cors"
            });
            
            if(!response.ok){
                throw new Error(\`HTTP error! status: \${response.status}\`)
            }
            return(await response.json()).summary
        }
        
        async function executeSummarization(){
            const url=getPageUrl();
            showLoader();
            try{
                const summary=await getSummary(url);
                hideLoader();
                showModal(summary,"URL")
            }catch(error){
                console.error("Error:",error);
                try{
                    const text=getPageText();
                    const summary=await getSummary(null,text);
                    hideLoader();
                    showModal(summary,"Page Text")
                }catch(error){
                    console.error("Error:",error);
                    hideLoader();
                    alert("Failed to summarize the page. Please try again later.")
                }
            }
        }
        
        executeSummarization()
    })()`;
}

// Modified request handler to support both summary and setup endpoints
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

    // Parse URL to check endpoint
    const url = new URL(req.url);
    const endpoint = url.pathname.split('/').pop();

    if (endpoint === 'setup') {
        if (req.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers
            });
        }

        const { apiKey } = await req.json();
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API key required' }), {
                status: 400,
                headers
            });
        }

        // Validate the API key
        const validation = await validateOpenAIKey(apiKey);
        if (!validation.valid) {
            return new Response(JSON.stringify({ 
                error: 'Invalid API key',
                details: validation.error 
            }), {
                status: 400,
                headers
            });
        }

        // Generate bookmarklet if key is valid
        const bookmarklet = generateBookmarklet(apiKey);
        return new Response(JSON.stringify({ bookmarklet }), {
            headers,
            status: 200
        });
    }

    // Original summary endpoint logic
    const apiKey = req.headers.get("X-OpenAI-Key");
    if (!apiKey) {
        return new Response(JSON.stringify({ error: "API key required" }), {
            status: 401,
            headers
        });
    }

    const { url: pageUrl, text } = await req.json();
    try {
        let summary;
        if (pageUrl) {
            summary = await summarizePage(pageUrl);
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

Then your setup page (hosted on summariz.io) would call the setup endpoint like this:

```javascript
async function setupBookmarklet(apiKey) {
    try {
        const response = await fetch('https://ulysse-bookmarkdigest.web.val.run/setup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ apiKey })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Setup failed');
        }

        const { bookmarklet } = await response.json();
        // Update the DOM with the bookmarklet
        document.getElementById('bookmarklet').href = bookmarklet;
        document.getElementById('bookmarkletContainer').style.display = 'block';
    } catch (error) {
        alert('Setup failed: ' + error.message);
    }
}
```

Key changes and benefits:
1. Single val.town instance handling both summary and setup
2. Server-side API key validation before generating bookmarklet
3. The bookmarklet code is generated server-side, making it easier to update
4. Basic key encoding (you can make this more secure)
5. No additional infrastructure needed

Would you like me to explain any part in more detail or show how to make the key storage more secure?