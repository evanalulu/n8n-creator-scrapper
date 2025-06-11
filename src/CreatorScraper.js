import { useState, useEffect } from 'react';
import axios from 'axios';
import { load } from 'cheerio';

const CreatorScraper = ({ onComplete, onProgress, onError }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const scrapeCreators = async () => {
      try {
        setIsLoading(true);
        onProgress('Initializing scraper...');
        
        // Try multiple CORS proxies in case one fails
        const corsProxies = [
          'https://corsproxy.io/?',
          'https://cors-anywhere.herokuapp.com/',
          'https://api.allorigins.win/raw?url='
        ];
        
        const targetUrl = 'https://n8n.io/creators/';
        
        let html = null;
        let proxyUsed = '';
        
        // Try each proxy until one works
        for (const proxy of corsProxies) {
          try {
            onProgress(`Trying proxy: ${proxy.split('?')[0]}...`);
            const response = await axios.get(`${proxy}${encodeURIComponent(targetUrl)}`, {
              timeout: 10000, // 10 second timeout
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              }
            });
            
            if (response.status === 200) {
              html = response.data;
              proxyUsed = proxy;
              onProgress(`Successfully fetched data using ${proxy.split('?')[0]}`);
              break;
            }
          } catch (proxyError) {
            console.error(`Proxy ${proxy} failed:`, proxyError);
            onProgress(`Proxy ${proxy.split('?')[0]} failed, trying next...`);
          }
        }
        
        if (!html) {
          throw new Error('All proxies failed. Please try the browser script method instead.');
        }
        
        onProgress('Parsing HTML...');
        const $ = load(html);
        
        // Extract creators from the page
        const creators = [];
        
        // Based on the screenshot, we need a completely different approach
        onProgress('Extracting creator information...');
        
        // Let's try to find all creator cards by looking for a common pattern
        // Each creator card likely has a similar structure
        
        // First, let's try to identify the creator cards by looking for elements with images
        // and text that matches our expected pattern
        $('div').each((index, element) => {
          // Check if this element has both an image and text containing "workflow templates"
          const hasImage = $(element).find('img').length > 0;
          const hasTemplatesText = $(element).text().includes('workflow templates');
          
          if (hasImage && hasTemplatesText) {
            // This might be a creator card
            // Let's extract the text content and parse it
            const cardText = $(element).text().trim();
            
            // Try to extract the name and templates count using regex
            const regex = /([^\d]+?)(\d+)\s+workflow\s+templates/i;
            const match = cardText.match(regex);
            
            if (match) {
              const name = match[1].trim();
              const templates = parseInt(match[2], 10);
              
              // Skip if we already have this creator or if name is empty
              if (creators.some(c => c.name === name) || !name) {
                return;
              }
              
              // Get the image URL
              const image = $(element).find('img').attr('src') || '';
              
              // For the profile URL, we'll construct it based on the name
              const profileSlug = name.toLowerCase().replace(/\s+/g, '-');
              const profile = `https://n8n.io/creator/${profileSlug}`;
              
              // Create the creator object with the specified structure
              const creator = {
                name,
                templates,
                image,
                profile
              };
              
              creators.push(creator);
              onProgress(`Found creator: ${name} with ${templates} templates`);
            }
          }
        });
        
        // If we didn't find any creators with the above approach, try a different one
        if (creators.length === 0) {
          onProgress('Trying alternative extraction method...');
          
          // Let's try to find elements that might contain creator information
          // by looking for specific patterns in the text
          const regex = /(\w+(?:\s+\w+)*)\s+(\d+)\s+workflow\s+templates/gi;
          const html = $.html();
          let match;
          
          while ((match = regex.exec(html)) !== null) {
            const name = match[1].trim();
            const templates = parseInt(match[2], 10);
            
            // Skip if we already have this creator or if name is empty
            if (creators.some(c => c.name === name) || !name) {
              continue;
            }
            
            // For the image and profile, we'll use placeholders
            const image = '';
            const profileSlug = name.toLowerCase().replace(/\s+/g, '-');
            const profile = `https://n8n.io/creator/${profileSlug}`;
            
            // Create the creator object with the specified structure
            const creator = {
              name,
              templates,
              image,
              profile
            };
            
            creators.push(creator);
            onProgress(`Found creator: ${name} with ${templates} templates`);
          }
        }
        
        // If we still didn't find any creators, provide a message about the browser script
        if (creators.length === 0) {
          onProgress('Note: Web scraping can be challenging due to complex page structures.');
          onProgress('For better results, try using the browser-script.js file directly in your browser console.');
          onProgress('See the browser-script.js file for instructions.');
          
          // Still throw an error to trigger the error state
          throw new Error('Could not extract any creators. Please try the browser script method instead.');
        }
        
        // Sort creators by number of templates (descending)
        creators.sort((a, b) => b.templates - a.templates);
        
        onProgress(`Completed! Found ${creators.length} creators`);
        onComplete(creators);
      } catch (error) {
        console.error('Error scraping creators:', error);
        
        // Provide a more helpful error message based on the error
        if (error.response && error.response.status === 403) {
          onError('Access forbidden (403). The website is blocking our requests. Please try the browser script method instead.');
        } else if (error.code === 'ECONNABORTED') {
          onError('Request timed out. The server took too long to respond. Please try again or use the browser script method.');
        } else if (error.message.includes('Network Error')) {
          onError('Network error. Please check your internet connection and try again, or use the browser script method.');
        } else {
          onError(error.message || 'Failed to scrape creators. Please try the browser script method instead.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    scrapeCreators();
  }, [onComplete, onProgress, onError]);
  
  return null; // This is a non-visual component
};

export default CreatorScraper;