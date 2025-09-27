import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// POST /api/auth/verify - Verify API key
export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    // Call the JAL Virtual API to get user data with API key authentication
    try {
      const jalApiResponse = await fetch('https://jalvirtual.com/api/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-Key': apiKey,
        },
      });

      console.log('JAL API Response Status:', jalApiResponse.status);
      console.log('JAL API Response OK:', jalApiResponse.ok);

      if (jalApiResponse.ok) {
        const jalApiData = await jalApiResponse.json();
        console.log('JAL API Response:', jalApiData);
        
        // Extract user data from JAL API response (phpVMS format)
        const jalUserData = jalApiData.data;
        console.log('Extracted User Data:', jalUserData);
        
        // Check if user exists in our staff database for role information
        try {
          const db = await getDatabase();
          const staffCollection = db.collection('staff');
          const staffMember = await staffCollection.findOne({ apiKey });
          
          const user = {
            id: jalUserData.id?.toString() || 'user_' + Date.now(),
            name: jalUserData.name || 'Staff Member',
            email: jalUserData.email || 'staff@jal.com',
            apiKey: apiKey,
            role: staffMember?.role || 'Staff',
            rank: jalUserData.rank || { name: 'Pilot' },
            pilot_id: jalUserData.pilot_id || null,
            home_airport: jalUserData.home_airport || null,
            curr_airport: jalUserData.curr_airport || null,
            airline: jalUserData.airline || null
          };
          
          console.log('Final User Object:', user);

          return NextResponse.json({
            ok: true,
            user: user
          });
        } catch (dbError) {
          console.log('Database not available, using JAL API data only:', dbError);
          // If database is not available, still return JAL API data
          const user = {
            id: jalUserData.id?.toString() || 'user_' + Date.now(),
            name: jalUserData.name || 'Staff Member',
            email: jalUserData.email || 'staff@jal.com',
            apiKey: apiKey,
            role: 'Staff',
            rank: jalUserData.rank || { name: 'Pilot' },
            pilot_id: jalUserData.pilot_id || null,
            home_airport: jalUserData.home_airport || null,
            curr_airport: jalUserData.curr_airport || null,
            airline: jalUserData.airline || null
          };
          
          console.log('Fallback User Object:', user);

          return NextResponse.json({
            ok: true,
            user: user
          });
        }
      } else {
        // JAL API returned an error, check if it's our admin key
        if (apiKey === '29e2bb1d4ae031ed47b6') {
          const adminUser = {
            id: 'admin_user',
            name: 'Admin User',
            email: 'admin@jal.com',
            apiKey: apiKey,
            role: 'Admin',
            rank: { name: 'Administrator' }
          };

          return NextResponse.json({
            ok: true,
            user: adminUser
          });
        }
        
        return NextResponse.json(
          { ok: false, error: 'Invalid API key' },
          { status: 401 }
        );
      }
    } catch (apiError) {
      console.error('JAL API Error:', apiError);
      console.error('API Error Details:', {
        message: apiError instanceof Error ? apiError.message : 'Unknown error',
        stack: apiError instanceof Error ? apiError.stack : undefined,
        apiKey: apiKey
      });
      
      // Fallback: Check if it's our admin key
      if (apiKey === '29e2bb1d4ae031ed47b6') {
        const adminUser = {
          id: 'admin_user',
          name: 'Admin User',
          email: 'admin@jal.com',
          apiKey: apiKey,
          role: 'Admin',
          rank: { name: 'Administrator' }
        };

        return NextResponse.json({
          ok: true,
          user: adminUser
        });
      }
      
      return NextResponse.json(
        { ok: false, error: 'Failed to verify API key with JAL Virtual API' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error verifying API key:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to verify API key' },
      { status: 500 }
    );
  }
}

