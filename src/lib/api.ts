import { AuthResponse, User, JALVirtualAPIResponse } from '@/types';

export class APIClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://jalvirtual.com/api';
  }

  async authenticate(): Promise<AuthResponse> {
    try {
      console.log('APIClient: Attempting authentication with baseUrl:', this.baseUrl);
      console.log('APIClient: API key (first 8 chars):', this.apiKey.substring(0, 8) + '...');
      
      // Try X-API-Key authentication first
      const response = await fetch(`${this.baseUrl}/user`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
          'Accept': 'application/json',
          'User-Agent': 'jal-training-system/1.0',
        },
        cache: 'no-store',
      });

      console.log('APIClient: X-API-Key response status:', response.status);

      if (response.ok) {
        const apiResponse: JALVirtualAPIResponse = await response.json();
        console.log('APIClient: X-API-Key user data:', apiResponse);
        return {
          success: true,
          user: apiResponse.data
        };
      }

      // Fallback to Bearer token
      console.log('APIClient: Trying Bearer token fallback');
      const bearerResponse = await fetch(`${this.baseUrl}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
          'User-Agent': 'jal-training-system/1.0',
        },
        cache: 'no-store',
      });

      console.log('APIClient: Bearer token response status:', bearerResponse.status);

      if (bearerResponse.ok) {
        const apiResponse: JALVirtualAPIResponse = await bearerResponse.json();
        console.log('APIClient: Bearer token user data:', apiResponse);
        return {
          success: true,
          user: apiResponse.data
        };
      }

      return {
        success: false,
        error: 'Invalid API key'
      };
    } catch {
      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }

  async getTrainingStats(): Promise<{ totalTrainingRequested: number; totalTrainingCompleted: number; totalTrainers: number; totalExaminers: number }> {
    // Mock data for now - replace with actual API call
    return {
      totalTrainingRequested: 15,
      totalTrainingCompleted: 89,
      totalTrainers: 12,
      totalExaminers: 8
    };
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('jal_api_key');
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const storedUser = localStorage.getItem('jal_user');
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  }
  return null;
}
