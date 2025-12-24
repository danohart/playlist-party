'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export function useAuth() {
  const { data: session, status } = useSession();
  const [anonymousToken, setAnonymousToken] = useState(null);
  
  useEffect(() => {
    // Load anonymous token from localStorage if exists
    if (!session && typeof window !== 'undefined') {
      const token = localStorage.getItem('anonymousToken');
      if (token) setAnonymousToken(token);
    }
  }, [session]);
  
  const isAuthenticated = !!session;
  const isAnonymous = !session && !!anonymousToken;
  const user = session?.user || null;
  const isLoading = status === 'loading';
  
  const createAnonymousUser = async (partyId, displayName) => {
    const response = await fetch('/api/users/anonymous', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partyId, displayName }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('anonymousToken', data.data.token);
      setAnonymousToken(data.data.token);
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to create anonymous user');
  };
  
  return {
    isAuthenticated,
    isAnonymous,
    user,
    anonymousToken,
    isLoading,
    createAnonymousUser,
  };
}
