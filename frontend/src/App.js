import React, { useState, useEffect } from 'react';
import ChatInterface from './ChatInterface';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    // Check backend health on component mount
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthStatus(data);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus({ status: 'unhealthy', error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading Teams RAG Chat...</p>
      </div>
    );
  }

  if (healthStatus && healthStatus.status !== 'healthy') {
    return (
      <div className="app-error">
        <h2>Service Unavailable</h2>
        <p>The backend service is not responding. Please check if the server is running.</p>
        <button onClick={checkHealth}>Retry</button>
        {healthStatus.services && (
          <div className="service-status">
            <h3>Service Status:</h3>
            <ul>
              {Object.entries(healthStatus.services).map(([service, status]) => (
                <li key={service} className={status === 'healthy' ? 'healthy' : 'unhealthy'}>
                  {service}: {status}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Teams RAG Chat</h1>
        <p>Query your Microsoft Teams conversations with AI</p>
      </header>
      <main className="app-main">
        <ChatInterface />
      </main>
      <footer className="app-footer">
        <p>Powered by Retrieval-Augmented Generation</p>
      </footer>
    </div>
  );
}

export default App;