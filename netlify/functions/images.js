const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret';

const IMAGES = [
  { 
    id: 1, 
    name: 'Content 1', 
    url: '/assets/images/img1.png',
    thumbnail: '/assets/images/img1.jpg',
    uploadedAt: '2025-01-15T10:30:00Z'
  },
  { 
    id: 2, 
    name: 'Content 2', 
    url: '/assets/images/img2.png',
    thumbnail: '/assets/images/thumbnails/img2-thumb.jpg',
    uploadedAt: '2025-01-20T14:45:00Z'
  }
];

exports.handler = async (event) => {
  try {
    // Verify authentication
    const authHeader = event.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET);

    // Handle search query
    const query = event.queryStringParameters.q || '';
    const filteredImages = IMAGES.filter(image => 
      image.name.toLowerCase().includes(query.toLowerCase())
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filteredImages)
    };
  } catch (error) {
    return {
      statusCode: error.name === 'JsonWebTokenError' ? 401 : 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: error.name === 'JsonWebTokenError' ? 'Invalid token' : 'Internal server error' 
      })
    };
  }
};
