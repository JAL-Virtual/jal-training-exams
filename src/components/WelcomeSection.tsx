'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';

export default function WelcomeSection() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const apiKey = localStorage.getItem('jal_api_key');
        if (!apiKey) return;

        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ apiKey }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.ok && result.user) {
            // Use the actual JAL Virtual API response structure
            setUser(result.user);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-2">
        <h2 className="text-2xl font-bold text-gray-900">Good Morning {user?.name || 'User'}</h2>
        <span className="text-2xl">{user?.airline?.country === 'Japan' ? '🇯🇵' : '✈️'}</span>
      </div>
      {user?.rank && (
        <p className="text-sm text-gray-500 mb-2">{user.rank.name} • {user.airline?.name}</p>
      )}
      <p className="text-gray-600">Welcome to JAL Virtual Training Portal.</p>
    </div>
  );
}
