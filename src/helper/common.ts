const md5 = require('md5');
const Bcrypt = require('bcrypt');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_PRIVATE_API_KEY,
});
export function encryptPassword(password) {
  return new Promise((resolve, reject) =>
    Bcrypt.hash(password, 10, (err, hash) => {
      if (err) reject();
      resolve(hash);
    }),
  );
}

export function generateInviteCode(payload) {
  return md5(payload);
}

export function verifyPassword(plain_password, hashed_password) {
  return new Promise((resolve, reject) => {
    Bcrypt.compare(plain_password, hashed_password, (err, result) => {
      if (err) {
        reject(false);
      } else if (!result) {
        reject(false);
      } else {
        resolve(true);
      }
    });
  });
}

export const sendMail = async (data) => {
  if (process.env.MAILGUN_OPEN === 'true') {
    const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, data);
    return response;
  } else {
    return Promise.resolve();
  }
};
