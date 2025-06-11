/**
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
      const regex = /([^\d]+?)(\d+)\s+workflow\s+templates/i;
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
      }
    });
    
    // Sort creators by number of templates (descending)
    return creators.sort((a, b) => b.templates - a.templates);
  }
  
  // Execute the script
  console.log('Starting to extract n8n creators...');
  const creators = extractCreators();
  console.log(`Found ${creators.length} creators`);
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
})();