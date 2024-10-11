(function() {
    // Function to get the current page URL
    function getPageUrl() {
        return window.location.href;
    }

    // Function to create and display the modal
    function showModal(summary) {
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
        content.innerHTML = `<h2>Page Summary</h2><p>${summary}</p><button id="closeModal">Close</button>`;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Close button event
        document.getElementById('closeModal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    // Function to send URL to Val Town val
    async function getSummary(url) {
        const response = await fetch('https://ulysse-propermaroonswordtail.web.val.run', { // Replace with your Val Town val URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }), // Send URL instead of text
        });

        const data = await response.json();
        return data.summary;
    }

    // Main execution
    async function executeSummarization() {
        const url = getPageUrl(); // Get the current page URL
        const summary = await getSummary(url);
        showModal(summary);
    }

    // Replace the fetch URL with a variable
    const apiUrl = 'https://ulysse-propermaroonswordtail.web.val.run/';

    // Modify the fetch request to include CORS mode and credentials
    fetch(apiUrl, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: window.location.href }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Process the response data
        console.log(data);
        // Add your logic to display the summary here
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to summarize the page. Please try again later.');
    });

    executeSummarization();
})();