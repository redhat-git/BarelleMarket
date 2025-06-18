import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Auth response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('User data received:', userData);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.log('Auth check failed, not authenticated');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include'
      });
      console.log('Logout response:', response.status);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/';
    }
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    logout,
    refetch: checkAuthStatus
  };
}