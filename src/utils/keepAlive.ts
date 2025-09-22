// Keep server alive by pinging it periodically
export const startKeepAlive = () => {
  const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes
  const API_URL = import.meta.env.PROD 
    ? 'https://cmf-studio-backend.onrender.com/api'
    : 'http://localhost:3001/api';
  
  const pingServer = async () => {
    try {
      const response = await fetch(`${API_URL}/keep-alive`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        console.log('✅ Server ping successful');
      } else {
        console.warn('⚠️ Server ping failed:', response.status);
      }
    } catch (error) {
      console.warn('⚠️ Server ping error:', error);
    }
  };

  // Ping immediately
  pingServer();
  
  // Set up interval
  const intervalId = setInterval(pingServer, PING_INTERVAL);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
};

// Start keep alive only in production
export const initKeepAlive = () => {
  if (import.meta.env.PROD) {
    return startKeepAlive();
  }
  return () => {}; // No-op cleanup function for development
};