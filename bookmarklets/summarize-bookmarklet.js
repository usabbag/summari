(function() {
    // Function to get the current page URL
    function getPageUrl() {
        return window.location.href;
    }

    // Function to get the page content
    function getPageContent() {
        return document.body.innerText;
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
        const apiUrl = 'https://ulysse-propermaroonswordtail.web.val.run';
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, text }),
            mode: 'cors',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.summary;
    }

    // Main execution
    async function executeSummarization() {
        const url = getPageUrl();
        try {
            const summary = await getSummary(url);
            showModal(summary, 'URL');
        } catch (error) {
            console.error('Error summarizing URL:', error);
            try {
                const text = getPageContent();
                const summary = await getSummary(null, text);
                showModal(summary, 'Page Text');
            } catch (fallbackError) {
                console.error('Error summarizing text content:', fallbackError);
                alert('Failed to summarize the page. Please try again later.');
            }
        }
    }

    executeSummarization();
})();