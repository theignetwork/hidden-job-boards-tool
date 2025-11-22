const { jwtVerify } = require('jose');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { token } = JSON.parse(event.body);

    if (!token) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'No token provided' })
      };
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[Auth API] JWT_SECRET not configured');
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    const secretKey = new TextEncoder().encode(secret);

    // Verify the JWT token
    const { payload } = await jwtVerify(token, secretKey);

    // Return the verified user data
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        valid: true,
        user: payload
      })
    };
  } catch (error) {
    console.error('[Auth API] Token verification failed:', error);
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Invalid or expired token' })
    };
  }
};
