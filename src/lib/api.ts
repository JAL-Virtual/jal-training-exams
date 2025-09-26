import { AuthResponse, User } from '@/types';

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
        const userData = await response.json();
        console.log('APIClient: X-API-Key user data:', userData);
        return {
          success: true,
          user: {
            id: userData.id || userData.pilotId || 'unknown',
            name: userData.name || userData.displayName || 'JAL Pilot',
            rank: userData.rank || userData.position || 'Pilot',
            country: userData.country || '🇯🇵',
            pilotId: userData.pilotId || userData.id || 'unknown',
          }
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
        const userData = await bearerResponse.json();
        console.log('APIClient: Bearer token user data:', userData);
        return {
          success: true,
          user: {
            id: userData.id || userData.pilotId || 'unknown',
            name: userData.name || userData.displayName || 'JAL Pilot',
            rank: userData.rank || userData.position || 'Pilot',
            country: userData.country || '🇯🇵',
            pilotId: userData.pilotId || userData.id || 'unknown',
          }
        };
      }

      return {
        success: false,
        error: 'Invalid API key'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }

  async getTrainingStats(): Promise<any> {
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
