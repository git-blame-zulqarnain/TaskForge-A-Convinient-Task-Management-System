const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error("TOKEN_GENERATION_ERROR: JWT_SECRET is UNDEFINED!");
    return 'jwt_secret_not_configured';
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, 
    {
    expiresIn: '10d',
  });
};

module.exports = generateToken;