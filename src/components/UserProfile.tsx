'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { User } from '@/types';
import { logger } from '@/lib/logger';

interface UserProfileProps {
  onLogout: () => void;
}

export default function UserProfile({ onLogout }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const apiKey = localStorage.getItem('jal_api_key');
        if (!apiKey) {
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ apiKey }),
        });

        if (response.ok) {
          const result = await response.json();
          logger.debug('API Response received', { 
            hasResult: !!result, 
            keys: Object.keys(result || {}),
            hasUser: !!result?.user 
          });
          
          if (result.ok && result.user) {
            logger.debug('User data processed', { 
              userId: result.user.id, 
              name: result.user.name,
              role: result.user.role,
              keysCount: Object.keys(result.user).length 
            });
            
            // Use the actual JAL Virtual API response structure
            logger.info('Using JAL Virtual API user data', { userId: result.user.id, name: result.user.name });
            setUser(result.user);
            // Update stored user data
            localStorage.setItem('jal_user', JSON.stringify(result.user));
          } else {
            logger.warn('No user data in response', { resultKeys: Object.keys(result || {}) });
          }
        } else {
          logger.error('API request failed', { status: response.status, statusText: response.statusText });
          const errorText = await response.text();
          logger.error('Error response', { errorText: errorText.substring(0, 200) });
        }
      } catch (error) {
        logger.error('Failed to fetch user data', { 
          message: error instanceof Error ? error.message : String(error) 
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
          <Image 
            src="/img/jal-icon.png"
            alt="JAL Icon"
            width={32}
            height={32}
            className="object-contain w-full h-full"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
          <Image 
            src="/img/jal-icon.png"
            alt="JAL Icon"
            width={32}
            height={32}
            className="object-contain w-full h-full"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{user?.name || 'Unknown User'}</p>
          <p className="text-xs text-gray-500">{user?.rank?.name || 'Pilot'}</p>
        </div>
      </div>
      <button 
        onClick={onLogout}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
