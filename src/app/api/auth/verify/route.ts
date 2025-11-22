import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 400 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[Auth API] JWT_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const secretKey = new TextEncoder().encode(secret);

    // Verify the JWT token
    const { payload } = await jwtVerify(token, secretKey);

    // Return the verified user data
    return NextResponse.json({
      valid: true,
      user: payload
    });
  } catch (error) {
    console.error('[Auth API] Token verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
