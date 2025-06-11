import { useState, useEffect } from 'react';
import CreatorScraper from './CreatorScraper';
import CreatorList from './CreatorList';
import './App.css';

function App() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');
  const [scrapeStarted, setScrapeStarted] = useState(false);
  const [showBrowserScript, setShowBrowserScript] = useState(false);
  const [browserScript, setBrowserScript] = useState('');

  useEffect(() => {
    // Fetch the browser script content
    fetch('/browser-script.js')
      .then(response => response.text())
      .then(text => setBrowserScript(text))
      .catch(err => console.error('Failed to load browser script:', err));
  }, []);

  const handleStartScraping = () => {
    setCreators([]);
    setLoading(true);
    setError(null);
    setProgress('');
    setScrapeStarted(true);
  };

  const handleComplete = (data) => {
    setCreators(data);
    setLoading(false);
  };

  const handleProgress = (message) => {
    setProgress(message);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setLoading(false);
  };

  const toggleBrowserScript = () => {
    setShowBrowserScript(!showBrowserScript);
  };

  // Hardcoded browser script as a fallback
  const fallbackScript = `/**
 * This script can be run in the browser console when visiting https://n8n.io/creators/
 * It will extract all creator information and return it in the required format.
 */

(function() {
  // Function to extract creators from the current page
  function extractCreators() {
    // Find all creator cards
    const creatorCards = Array.from(document.querySelectorAll('div[class*="card"], div[class*="creator"]'));
    
    const creators = [];
    
    // Process each card
    creatorCards.forEach(card => {
      // Check if this card contains workflow templates text
      const text = card.textContent;
      if (!text.includes('workflow templates')) return;
      
      // Extract name and templates count using regex
      const regex = /([^\\d]+?)(\\d+)\\s+workflow\\s+templates/i;
      const match = text.match(regex);
      
      if (match) {
        const name = match[1].trim();
        const templates = parseInt(match[2], 10);
        
        // Skip if we already have this creator or if name is empty
        if (creators.some(c => c.name === name) || !name) {
          return;
        }
        
        // Get the image URL
        const img = card.querySelector('img');
        const image = img ? img.src : '';
        
        // For the profile URL, construct it based on the name
        const profileSlug = name.toLowerCase().replace(/\\s+/g, '-');
        const profile = \`https://n8n.io/creator/\${profileSlug}\`;
        
        // Create the creator object with the specified structure
        const creator = {
          name,
          templates,
          image,
          profile
        };
        
        creators.push(creator);
      }
    });
    
    // Sort creators by number of templates (descending)
    return creators.sort((a, b) => b.templates - a.templates);
  }
  
  // Execute the script
  console.log('Starting to extract n8n creators...');
  const creators = extractCreators();
  console.log(\`Found \${creators.length} creators\`);
  console.log('Creator data:');
  console.log(JSON.stringify(creators, null, 2));
  
  // Create a download link for the data
  const dataStr = JSON.stringify(creators, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'n8n-creators.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.style.display = 'none';
  document.body.appendChild(linkElement);
  linkElement.click();
  document.body.removeChild(linkElement);
  
  console.log('Data has been downloaded as n8n-creators.json');
})();`;

  return (
    <div className="App">
      <header className="App-header">
        <h1>n8n Creators Scraper</h1>
        
        {!scrapeStarted ? (
          <div className="start-container">
            <p>
              This app will scrape the n8n.io/creators page and extract information about all creators.
              The data will be stored in the following format:
            </p>
            <pre className="code-example">
{`{
  "name": "Harshil Agrawal",
  "templates": 186,
  "image": "https://n8n.io/path/to/avatar.jpg",
  "profile": "https://n8n.io/creator/harshil-agrawal"
}`}
            </pre>
            <div className="button-container">
              <button className="start-button" onClick={handleStartScraping}>
                Start Scraping
              </button>
              <button className="alt-button" onClick={toggleBrowserScript}>
                {showBrowserScript ? 'Hide Browser Script' : 'Show Browser Script'}
              </button>
            </div>
            
            {showBrowserScript && (
              <div className="browser-script-container">
                <h3>Browser Script Method</h3>
                <p>
                  For more reliable results, you can use the browser script method:
                </p>
                <ol>
                  <li>Visit <a href="https://n8n.io/creators/" target="_blank" rel="noopener noreferrer">https://n8n.io/creators/</a> in your browser</li>
                  <li>Open the browser console (F12 or right-click {'>'} Inspect {'>'} Console)</li>
                  <li>Copy and paste the following script into the console and press Enter:</li>
                </ol>
                <pre className="code-example script">
                  {browserScript || fallbackScript}
                </pre>
                <p>
                  This will extract all creators and automatically download the data as a JSON file.
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {loading && (
              <div className="loading-container">
                <div className="loader"></div>
                <p>Scraping in progress...</p>
                <p className="progress">{progress}</p>
              </div>
            )}
            
            {error && (
              <div className="error-container">
                <p className="error">Error: {error}</p>
                <button className="retry-button" onClick={handleStartScraping}>
                  Try Again
                </button>
                <button className="alt-button" onClick={toggleBrowserScript}>
                  Try Browser Script Method
                </button>
              </div>
            )}
            
            {!loading && !error && creators.length > 0 && (
              <CreatorList creators={creators} />
            )}
            
            {scrapeStarted && !loading && !error && creators.length === 0 && (
              <div className="no-results-container">
                <p>No creators found. Please try the browser script method instead.</p>
                <button className="alt-button" onClick={toggleBrowserScript}>
                  Show Browser Script
                </button>
              </div>
            )}
            
            {scrapeStarted && !loading && (
              <div className="button-container">
                <button className="start-button" onClick={handleStartScraping}>
                  Scrape Again
                </button>
                <button className="home-button" onClick={() => setScrapeStarted(false)}>
                  Back to Home
                </button>
              </div>
            )}
          </>
        )}
      </header>
      
      {scrapeStarted && (
        <CreatorScraper 
          onComplete={handleComplete} 
          onProgress={handleProgress} 
          onError={handleError} 
        />
      )}
    </div>
  );
}

export default App;
