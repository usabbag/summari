(function() {
    // Function to get the current page URL
    function getPageUrl() {
        return window.location.href;
    }

    // Function to get the page content
    function getPageContent() {
        return document.body.innerText;
    }

    // Function to create and display the loader
    function showLoader() {
        const loader = document.createElement('div');
        loader.id = 'summaryLoader';
        loader.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10001;
            font-family: Arial, sans-serif;
        `;
        loader.textContent = 'Summarizing...';
        document.body.appendChild(loader);
    }

    // Function to remove the loader
    function removeLoader() {
        const loader = document.getElementById('summaryLoader');
        if (loader) {
            document.body.removeChild(loader);
        }
    }

    // Function to create and display the modal
    function showModal(summary, source) {
        // Check if modal already exists
        if (document.getElementById('summaryModal')) return;

        // Create modal elements
        const modal = document.createElement('div');
        modal.id = 'summaryModal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '10000';

        const content = document.createElement('div');
        content.style.backgroundColor = '#fff';
        content.style.padding = '20px';
        content.style.borderRadius = '8px';
        content.style.maxWidth = '80%';
        content.style.maxHeight = '80%';
        content.style.overflowY = 'auto';
        content.innerHTML = `<h2>Page Summary</h2><p><strong>Source: ${source}</strong></p><p>${summary}</p><button id="closeModal">Close</button>`;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Close button event
        document.getElementById('closeModal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    // Function to send URL or text to Val Town val
    async function getSummary(url, text) {
        const apiKey = getApiKey();
        if (!apiKey) {
            throw new Error('API key required');
        }

        const apiUrl = 'https://ulysse-bookmarkdigest.web.val.run';
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-OpenAI-Key': apiKey
            },
            body: JSON.stringify({ url, text }),
            mode: 'cors'
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('openai_api_key');
                throw new Error('Invalid API key');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.summary;
    }

    function getApiKey() {
        let key = localStorage.getItem('openai_api_key');
        if (!key) {
            key = prompt('Please enter your OpenAI API key:');
            if (key) {
                localStorage.setItem('openai_api_key', key);
            }
        }
        return key;
    }

    // Main execution
    async function executeSummarization() {
        const url = getPageUrl();
        showLoader();
        try {
            const summary = await getSummary(url);
            removeLoader();
            showModal(summary, 'URL');
        } catch (error) {
            console.error('Error summarizing URL:', error);
            try {
                const text = getPageContent();
                const summary = await getSummary(null, text);
                removeLoader();
                showModal(summary, 'Page Text');
            } catch (fallbackError) {
                console.error('Error summarizing text content:', fallbackError);
                removeLoader();
                alert('Failed to summarize the page. Please try again later.');
            }
        }
    }

    executeSummarization();
})();