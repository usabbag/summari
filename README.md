# Web Page Summarizer Bookmarklet

This bookmarklet uses Val Town to provide quick summaries of web pages you're viewing. It's a convenient tool for getting the gist of an article or webpage without reading the entire content.

## How It Works

1. **Bookmarklet Activation**: When you click the bookmarklet in your browser, it triggers a JavaScript function.

2. **Page URL Retrieval**: The script gets the current page's URL using `window.location.href`.

3. **API Request**: The URL is sent to a Val Town function (hosted at `https://https://ulysse-bookmarkdigest.web.val.run`) via a POST request.

4. **Text Summarization**: The Val Town function processes the webpage content and generates a summary.

5. **Display Summary**: Upon receiving the summary, the bookmarklet creates a modal dialog on the current page to display the result.

## Key Components

- **getPageUrl()**: Retrieves the current page URL.
- **showModal(summary)**: Creates and displays a modal with the summary.
- **getSummary(url)**: Sends the URL to the Val Town function and retrieves the summary.
- **executeSummarization()**: Orchestrates the summarization process.

## Technical Details

- The bookmarklet uses vanilla JavaScript and doesn't require any external libraries.
- It makes an asynchronous fetch request to the Val Town API.
- CORS mode is set to 'cors' and credentials are included in the request.
- Error handling is implemented to alert users if summarization fails.

## Usage

1. Create a new bookmark in your browser.
2. Set the bookmark's URL to the JavaScript code (minified version recommended).
3. When on a webpage you want to summarize, click the bookmarklet.
4. A modal will appear with the summary of the current page.

## Note

Ensure that the Val Town function URL is up-to-date and functioning. The current URL in the code is a placeholder and may need to be replaced with your actual Val Town function URL.
