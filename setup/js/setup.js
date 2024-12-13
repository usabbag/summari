document.getElementById('setupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const apiKey = document.getElementById('apiKey').value;
    
    // Create a browser fingerprint for encryption
    const browserFingerprint = [
        navigator.userAgent,
        screen.width,
        screen.height,
        navigator.language,
        new Date().getTimezoneOffset()
    ].join('|');

    // Basic encryption using browser data as salt
    function encryptKey(key, fingerprint) {
        const encoder = new TextEncoder();
        const data = encoder.encode(key + fingerprint);
        return btoa(String.fromCharCode(...new Uint8Array(data)));
    }

    const encryptedKey = encryptKey(apiKey, browserFingerprint);
    
    // Generate the bookmarklet code based on the existing minified version
    const bookmarkletCode = `javascript:(function(){function e(){return window.location.href}function t(){return document.body.innerText}function n(){const e=document.createElement("div");e.id="summaryLoader",e.style.cssText="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background-color:#007311;color:white;padding:20px;border-radius:10px;z-index:10001;font-family:Arial,sans-serif;",e.textContent="Summarizing...",document.body.appendChild(e)}function o(){const e=document.getElementById("summaryLoader");e&&document.body.removeChild(e)}function r(e,t){if(!document.getElementById("summaryModal")){const n=document.createElement("div");n.id="summaryModal",n.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000;font-family:-apple-system,system-ui,sans-serif;";const o=document.createElement("div");o.style.cssText="background-color:#fff;padding:24px;border-radius:12px;width:600px;max-width:90%;max-height:80vh;overflow-y:auto;font-size:16px;line-height:1.5;box-shadow:0 4px 12px rgba(0,0,0,0.15);",o.innerHTML=\`<h2 style="margin:0 0 16px;font-size:20px;color:#1f2937">Summary</h2><p style="margin:0 0 16px;font-size:14px;color:#4b5563"><strong>Source: \${t}</strong></p><p style="margin:0;font-size:18px;color:#1f2937">\${e}</p><button id="closeModal" style="margin-top:20px;padding:8px 16px;background:#007311;color:white;border:none;border-radius:6px;cursor:pointer">Close</button>\`,n.appendChild(o),document.body.appendChild(n),document.getElementById("closeModal").addEventListener("click",()=>{document.body.removeChild(n)})}}function i(){const f=[navigator.userAgent,screen.width,screen.height,navigator.language,new Date().getTimezoneOffset()].join('|');try{const d=atob('${encryptedKey}');const c=new TextDecoder();const a=new Uint8Array([...d].map(c=>c.charCodeAt(0)));return c.decode(a).replace(f,'')}catch(e){alert('This bookmarklet only works in the browser where it was created');return null}}async function a(e,t){const n=i();if(!n)return;const o=await fetch("https://ulysse-bookmarkdigest.web.val.run",{method:"POST",headers:{"Content-Type":"application/json","X-OpenAI-Key":n},body:JSON.stringify({url:e,text:t}),mode:"cors"});if(!o.ok){if(401===o.status)throw new Error("Invalid API key");throw new Error(\`HTTP error! status: \${o.status}\`)}return(await o.json()).summary}async function s(){const i=e();n();try{const e=await a(i);o(),r(e,"URL")}catch(e){console.error("Error:",e);try{const e=t(),i=await a(null,e);o(),r(i,"Page Text")}catch(e){console.error("Error:",e),o(),alert("Failed to summarize the page. Please try again later.")}}}s()})();`;

    // Update the bookmarklet link
    const bookmarklet = document.getElementById('bookmarklet');
    bookmarklet.href = bookmarkletCode;
    
    // Show the bookmarklet container
    document.getElementById('bookmarkletContainer').style.display = 'block';
}); 