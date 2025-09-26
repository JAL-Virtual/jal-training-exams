import { NextRequest, NextResponse } from 'next/server';
import { APIClient } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    console.log('API Route: Authentication request received');
    const { apiKey } = await request.json();
    console.log('API Route: API key received (first 8 chars):', apiKey?.substring(0, 8) + '...');

    if (!apiKey) {
      console.log('API Route: No API key provided');
      return NextResponse.json(
        { success: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    console.log('API Route: Creating APIClient and calling authenticate()');
    const apiClient = new APIClient(apiKey);
    const result = await apiClient.authenticate();
    console.log('API Route: Authentication result:', result);

    if (result.success) {
      console.log('API Route: Authentication successful');
      return NextResponse.json(result);
    } else {
      console.log('API Route: Authentication failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('API Route: Authentication error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
