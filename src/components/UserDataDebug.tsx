'use client';

import React, { useState, useEffect } from 'react';

export default function UserDataDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        const apiKey = localStorage.getItem('jal_api_key');
        if (!apiKey) {
          setDebugInfo({ error: 'No API key found' });
          return;
        }

        console.log('Testing API with key:', apiKey.substring(0, 8) + '...');

        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ apiKey }),
        });

        const result = await response.json();
        console.log('Full API Response:', result);
        
        setDebugInfo({
          status: response.status,
          ok: response.ok,
          result: result,
          userKeys: result.user ? Object.keys(result.user) : [],
          userData: result.user
        });

      } catch (error) {
        console.error('API Test Error:', error);
        setDebugInfo({ 
          error: error instanceof Error ? error.message : 'An unknown error occurred' 
        });
      }
    };

    testAPI();
  }, []);

  if (!debugInfo) {
    return <div>Loading debug info...</div>;
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg text-xs font-mono">
      <h3 className="font-bold mb-2">API Debug Info:</h3>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
}
