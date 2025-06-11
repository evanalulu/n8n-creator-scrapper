# n8n Creators Scraper

This React application scrapes the [n8n.io/creators](https://n8n.io/creators/) page to extract information about all creators and their workflow templates.

## Features

- Extracts creator information including name, number of templates, profile image, and profile URL
- Provides a visual interface to view and sort the extracted data
- Offers a browser script method for more reliable extraction
- Allows downloading the extracted data as JSON

## Installation

1. Clone this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Method 1: Using the React App

1. Click the "Start Scraping" button on the homepage
2. Wait for the scraping process to complete
3. View the extracted creator information
4. Download the data using the "Download JSON" button

**Note:** This method may fail due to CORS restrictions or website structure changes.

### Method 2: Using the Browser Script (Recommended)

1. Click the "Show Browser Script" button on the homepage
2. Visit [n8n.io/creators](https://n8n.io/creators/) in your browser
3. Open the browser console (F12 or right-click > Inspect > Console)
4. Copy and paste the provided script into the console
5. Press Enter to execute the script
6. The data will be automatically downloaded as a JSON file

## Data Structure

The extracted data follows this structure:

```json
{
  "name": "Harshil Agrawal",
  "templates": 186,
  "image": "https://n8n.io/path/to/avatar.jpg",
  "profile": "https://n8n.io/creator/harshil-agrawal"
}
```

## Troubleshooting

### CORS Issues

If you encounter CORS (Cross-Origin Resource Sharing) errors when using the React app, try the browser script method instead. The browser script method runs directly in your browser and avoids CORS restrictions.

### No Creators Found

If the application fails to find any creators, it could be due to changes in the website's HTML structure. Try the browser script method, which uses a more direct approach to extract the data.

### Browser Script Not Working

If the browser script method also fails, it might be due to changes in the website's structure. Please open an issue on GitHub with details about the problem.

## License

MIT
