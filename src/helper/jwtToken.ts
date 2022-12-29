// import Jwt from 'jsonwebtoken';
const Jwt = require('jsonwebtoken');
const { promisify } = require('util');

export async function issueJwtToken(payload) {
  try {
    const token = await promisify(Jwt.sign)(
      {
        id: payload.id,
        email: payload.email,
        createdAt: payload.createdAt,
      },
      process.env.JWT_SECRET,
      { algorithm: 'HS512', expiresIn: `${process.env.JWT_EXPIRES}` },
    );

    return token;
  } catch (e) {
    return e;
  }
}

// verifies given jwt token.

export function verify(token, callback) {
  try {
    return Jwt.verify(token, process.env.JWT_SECRET, {}, callback);
  } catch (err) {
    return 'error';
  }
}
