javascript:(function(){
    function getPageUrl() {
        return window.location.href;
    }

    function getPageText() {
        return document.body.innerText;
    }

    function showLoader() {
        const loader = document.createElement("div");
        loader.id = "summaryLoader";
        loader.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background-color:rgba(0,0,0,0.7);color:white;padding:20px;border-radius:10px;z-index:10001;font-family:Arial,sans-serif;";
        loader.textContent = "Summarizing...";
        document.body.appendChild(loader);
    }

    function hideLoader() {
        const loader = document.getElementById("summaryLoader");
        if (loader) {
            document.body.removeChild(loader);
        }
    }

    function showModal(summary, source) {
        if (!document.getElementById("summaryModal")) {
            const modal = document.createElement("div");
            modal.id = "summaryModal";
            modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000;";

            const content = document.createElement("div");
            content.style.cssText = "background-color:#fff;padding:20px;border-radius:8px;max-width:80%;max-height:80%;overflow-y:auto;";
            content.innerHTML = `<h2>Page Summary</h2><p><strong>Source: ${source}</strong></p><p>${summary}</p><button id="closeModal">Close</button>`;

            modal.appendChild(content);
            document.body.appendChild(modal);

            document.getElementById("closeModal").addEventListener("click", () => {
                document.body.removeChild(modal);
            });
        }
    }

    function getApiKey() {
        let key = localStorage.getItem("anthropic_api_key");
        if (!key) {
            key = prompt("Please enter your Anthropic API key, from console.anthropic.com:");
            if (key) {
                localStorage.setItem("anthropic_api_key", key);
            }
        }
        return key;
    }

    async function getSummary(url, text) {
        const apiKey = getApiKey();
        if (!apiKey) {
            throw new Error("API key required");
        }

        const response = await fetch("https://summari-worker.ulysse.workers.dev", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Anthropic-Key": apiKey
            },
            body: JSON.stringify({ url, text }),
            mode: "cors"
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem("anthropic_api_key");
                throw new Error("Invalid API key");
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return (await response.json()).summary;
    }

    async function executeSummarization() {
        const url = getPageUrl();
        showLoader();

        try {
            const summary = await getSummary(url);
            hideLoader();
            showModal(summary, "URL");
        } catch (error) {
            console.error("Error:", error);
            try {
                const text = getPageText();
                const summary = await getSummary(null, text);
                hideLoader();
                showModal(summary, "Page Text");
            } catch (error) {
                console.error("Error:", error);
                hideLoader();
                alert("Failed to summarize the page. Please try again later.");
            }
        }
    }

    executeSummarization();
})();