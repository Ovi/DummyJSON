const { verifyUserHandler } = require('../helpers');
const {
  dataInMemory: frozenData,
  getMultiObjectSubset,
  getObjectSubset,
  getNestedValue,
  limitArray,
} = require('../utils/util');

const controller = {};

// get all users
controller.getAllUsers = ({ limit, skip, select }) => {
  let [...users] = frozenData.users;
  const total = users.length;

  if (skip > 0) {
    users = users.slice(skip);
  }

  users = limitArray(users, limit);

  if (select) {
    users = getMultiObjectSubset(users, select);
  }

  const result = { users, total, skip, limit: users.length };

  return result;
};

// search users
controller.searchUsers = ({ limit, skip, select, q: searchQuery }) => {
  let [...users] = frozenData.users.filter(u => {
    return (
      u.firstName.toLowerCase().includes(searchQuery) ||
      u.lastName.toLowerCase().includes(searchQuery) ||
      u.email.toLowerCase().includes(searchQuery) ||
      u.username.toLowerCase().includes(searchQuery)
    );
  });
  const total = users.length;

  if (skip > 0) {
    users = users.slice(skip);
  }

  users = limitArray(users, limit);

  if (select) {
    users = getMultiObjectSubset(users, select);
  }

  const result = { users, total, skip, limit: users.length };

  return result;
};

// filter users
controller.filterUsers = ({ limit, skip, select, key, value }) => {
  let [...users] = frozenData.users.filter(u => {
    const val = getNestedValue(u, key);
    return val && val.toString() === value;
  });

  const total = users.length;

  if (skip > 0) {
    users = users.slice(skip);
  }

  users = limitArray(users, limit);

  if (select) {
    users = getMultiObjectSubset(users, select);
  }

  const result = { users, total, skip, limit: users.length };

  return result;
};

// get user by id
controller.getUserById = ({ id, select }) => {
  let { ...user } = verifyUserHandler(id);

  if (select) {
    user = getObjectSubset(user, select);
  }

  return user;
};

// add new user
controller.addNewUser = ({ ...data }) => {
  const {
    firstName = '',
    lastName = '',
    maidenName = '',
    age = null,
    gender = '',
    email = '',
    phone = '',
    username = '',
    password = '',
    birthDate = '',
    image = '',
    bloodGroup = '',
    height = null,
    weight = null,
    eyeColor = '',
    hair = { color: '', type: '' },
    domain = '',
    ip = '',
    address = {
      address: '',
      city: '',
      coordinates: { lat: null, lng: null },
      postalCode: '',
      state: '',
    },
    macAddress = '',
    university = '',
    bank = {
      cardExpire: '',
      cardNumber: '',
      cardType: '',
      currency: '',
      iban: '',
    },
    company = {
      address: {
        address: '',
        city: '',
        coordinates: { lat: null, lng: null },
        postalCode: '',
        state: '',
      },
      department: '',
      name: '',
      title: '',
    },
    ein = '',
    ssn = '',
    userAgent = '',
  } = data;

  const newUser = {
    id: frozenData.users.length + 1,
    firstName,
    lastName,
    maidenName,
    age,
    gender,
    email,
    phone,
    username,
    password,
    birthDate,
    image,
    bloodGroup,
    height,
    weight,
    eyeColor,
    hair,
    domain,
    ip,
    address,
    macAddress,
    university,
    bank,
    company,
    ein,
    ssn,
    userAgent,
  };

  return newUser;
};

// update user by id
controller.updateUserById = ({ id, ...data }) => {
  const {
    firstName = '',
    lastName = '',
    maidenName = '',
    age = null,
    gender = '',
    email = '',
    phone = '',
    username = '',
    password = '',
    birthDate = '',
    image = '',
    bloodGroup = '',
    height = null,
    weight = null,
    eyeColor = '',
    hair = { color: '', type: '' },
    domain = '',
    ip = '',
    address = {
      address: '',
      city: '',
      coordinates: { lat: null, lng: null },
      postalCode: '',
      state: '',
    },
    macAddress = '',
    university = '',
    bank = {
      cardExpire: '',
      cardNumber: '',
      cardType: '',
      currency: '',
      iban: '',
    },
    company = {
      address: {
        address: '',
        city: '',
        coordinates: { lat: null, lng: null },
        postalCode: '',
        state: '',
      },
      department: '',
      name: '',
      title: '',
    },
    ein = '',
    ssn = '',
    userAgent = '',
  } = data;

  const user = verifyUserHandler(id);

  const updatedUser = {
    id: +id, // converting id to number
    firstName: firstName || user.firstName,
    lastName: lastName || user.lastName,
    maidenName: maidenName || user.maidenName,
    age: age || user.age,
    gender: gender || user.gender,
    email: email || user.email,
    phone: phone || user.phone,
    username: username || user.username,
    password: password || user.password,
    birthDate: birthDate || user.birthDate,
    image: image || user.image,
    bloodGroup: bloodGroup || user.bloodGroup,
    height: height || user.height,
    weight: weight || user.weight,
    eyeColor: eyeColor || user.eyeColor,
    hair: hair || user.hair,
    domain: domain || user.domain,
    ip: ip || user.ip,
    address: address || user.address,
    macAddress: macAddress || user.macAddress,
    university: university || user.university,
    bank: bank || user.bank,
    company: company || user.company,
    ein: ein || user.ein,
    ssn: ssn || user.ssn,
    userAgent: userAgent || user.userAgent,
  };

  return updatedUser;
};

// delete user by id
controller.deleteUserById = ({ id }) => {
  const { ...user } = verifyUserHandler(id);

  user.isDeleted = true;
  user.deletedOn = new Date().toISOString();

  return user;
};

module.exports = controller;
