import React from 'react';
import './CreatorList.css';

const CreatorList = ({ creators }) => {
  if (!creators || creators.length === 0) {
    return <p>No creators found.</p>;
  }

  return (
    <div className="creator-list">
      <div className="creator-stats">
        <div className="stat-box">
          <h3>Total Creators</h3>
          <p>{creators.length}</p>
        </div>
        <div className="stat-box">
          <h3>Total Templates</h3>
          <p>{creators.reduce((sum, creator) => sum + creator.templates, 0)}</p>
        </div>
        <div className="stat-box">
          <h3>Top Creator</h3>
          <p>{creators[0].name}</p>
          <p className="templates-count">{creators[0].templates} templates</p>
        </div>
      </div>

      <div className="creator-grid">
        {creators.map((creator, index) => (
          <div key={index} className="creator-card">
            <div className="creator-image">
              {creator.image ? (
                <img src={creator.image} alt={`${creator.name}`} />
              ) : (
                <div className="placeholder-image">{creator.name.charAt(0)}</div>
              )}
            </div>
            <div className="creator-info">
              <h3>{creator.name}</h3>
              <p>{creator.templates} templates</p>
              <a 
                href={creator.profile} 
                target="_blank" 
                rel="noopener noreferrer"
                className="profile-link"
              >
                View Profile
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="export-section">
        <h3>Export Data</h3>
        <button 
          onClick={() => {
            const dataStr = JSON.stringify(creators, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = 'n8n-creators.json';
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
          }}
          className="export-button"
        >
          Download JSON
        </button>
      </div>
    </div>
  );
};

export default CreatorList;