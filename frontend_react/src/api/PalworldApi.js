export const getPalworldStatus = async () => {
  const response = await fetch('/api/v1/python/palworld/status');

  if (!response.ok) {
    throw new Error(`Palworld status request failed with HTTP ${response.status}`);
  }

  return response.json();
};

export const subscribeToPalworldStatus = ({ onMessage, onError }) => {
  const events = new EventSource('/api/v1/python/palworld/events');

  events.onmessage = (event) => onMessage(JSON.parse(event.data));
  events.onerror = onError;

  return () => events.close();
};
