require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret';
const JWT_EXPIRY = '2h';

const VALID_USERS = {
  'randy kyle': {
    passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrqphJY8WX7xXZ7lD2L1Z2uQbY6FzOa' 
  }
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }

  try {
    const { username, password } = JSON.parse(event.body);
    
    if (!username || !password) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Username and password are required' })
      };
    }

    const userKey = username.toLowerCase();
    const user = VALID_USERS[userKey];
    
    if (!user) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!passwordValid) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    const token = jwt.sign(
      { username: userKey }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRY }
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        token,
        username: userKey
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
