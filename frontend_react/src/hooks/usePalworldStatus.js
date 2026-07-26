import { useEffect, useState } from 'react';
import {
  getPalworldStatus,
  subscribeToPalworldStatus,
} from '../api/PalworldApi';

export const usePalworldStatus = () => {
  const [status, setStatus] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getPalworldStatus()
      .then((snapshot) => {
        if (isMounted) setStatus(snapshot);
      })
      .catch(() => {
        if (isMounted) setError('Unable to load the server monitor.');
      });

    const unsubscribe = subscribeToPalworldStatus({
      onMessage: (snapshot) => {
        if (!isMounted) return;
        setStatus(snapshot);
        setIsConnected(true);
        setError(null);
      },
      onError: () => {
        if (isMounted) setIsConnected(false);
      },
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { status, isConnected, error };
};
