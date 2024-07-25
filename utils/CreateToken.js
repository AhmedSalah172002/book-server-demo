const jwt = require('jsonwebtoken');


const CreateToken = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRE_TIME,
    });
  
  module.exports = CreateToken;