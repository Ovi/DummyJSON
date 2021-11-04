const APIError = require('../utils/error');
const { generateToken } = require('../utils/jwt');
const { dataInMemory: frozenData } = require('../utils/util');

const controller = {};

// login user by username and password
controller.loginByUsernamePassword = async data => {
  const { username, password, expiresInMins } = data;

  const user = frozenData.users.find(u => {
    const validUsername = u.username.toLowerCase() === username.toLowerCase();
    const validPassword = u.password === password;

    return validUsername && validPassword;
  });

  if (!user) {
    throw new APIError(`Invalid credentials`, 400);
  }

  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender,
    image: user.image,
    country: user.country,
    city: user.city,
  };

  try {
    const token = await generateToken(payload, expiresInMins);

    return {
      ...payload,
      token,
    };
  } catch (err) {
    throw new APIError(err.message, 400);
  }
};

module.exports = controller;
