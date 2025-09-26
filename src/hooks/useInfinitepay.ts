'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUser, UserData, waitForInfinitepay } from '@/lib/infinitepay';

export function useInfinitepayApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApi = async () => {
      try {
        await waitForInfinitepay();
        setIsInitialized(true);
      } catch (error) {
        console.warn('Infinitepay API not available, running in development mode');
        setIsInitialized(true);
      }
    };

    initializeApi();
  }, []);

  const executeApiCall = useCallback(async <T>(apiCall: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'API call failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    isInitialized,
    executeApiCall
  };
}

export function useUserData() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { executeApiCall, isInitialized } = useInfinitepayApi();

  useEffect(() => {
    const loadUserData = async () => {
      if (!isInitialized) return;

      try {
        const user = await executeApiCall(() => getUser());
        setUserData(user);
      } catch (error) {
        console.warn('Failed to load user data:', error);
        // Mock user data for development
        setUserData({
          id: 1,
          name: 'Usuário de Teste',
          handle: 'teste',
          role: 'user'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [executeApiCall, isInitialized]);

  return { userData, isLoading };
}