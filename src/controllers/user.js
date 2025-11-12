import { verifyUserHandler } from '../helpers/index.js';
import {
  dataInMemory as frozenData,
  getMultiObjectSubset,
  getObjectSubset,
  getNestedValue,
  limitArray,
  sortArray,
} from '../utils/util.js';

// get all users
export const getAllUsers = _options => {
  const { limit, skip, select, sortBy, order } = _options;

  let users = [...frozenData.users];
  const total = users.length;

  users = sortArray(users, sortBy, order);

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
export const searchUsers = ({ q: searchQuery, ..._options }) => {
  const { limit, skip, select, sortBy, order } = _options;

  let users = frozenData.users.filter(u => {
    return (
      u.firstName.toLowerCase().includes(searchQuery) ||
      u.lastName.toLowerCase().includes(searchQuery) ||
      u.email.toLowerCase().includes(searchQuery) ||
      u.username.toLowerCase().includes(searchQuery)
    );
  });
  const total = users.length;

  users = sortArray(users, sortBy, order);

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
export const filterUsers = ({ key, value, ..._options }) => {
  const { limit, skip, select, sortBy, order } = _options;

  let users = frozenData.users.filter(u => {
    const val = getNestedValue(u, key);
    return val && val.toString() === value;
  });
  const total = users.length;

  users = sortArray(users, sortBy, order);

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
export const getUserById = ({ id, select }) => {
  let { ...user } = verifyUserHandler(id);

  if (select) {
    user = getObjectSubset(user, select);
  }

  return user;
};

// add new user
export const addNewUser = ({ ...data }) => {
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
    hair,
    ip = '',
    address,
    macAddress = '',
    university = '',
    bank,
    company,
    ein = '',
    ssn = '',
    userAgent = '',
    crypto,
    role = 'user',
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
    hair: {
      color: hair?.color || '',
      type: hair?.type || '',
    },
    ip,
    address: {
      address: address?.address || '',
      city: address?.city || '',
      state: address?.state || '',
      stateCode: address?.stateCode || '',
      postalCode: address?.postalCode || '',
      coordinates: {
        lat: address?.coordinates?.lat || null,
        lng: address?.coordinates?.lng || null,
      },
      country: address?.country || '',
    },
    macAddress,
    university,
    bank: {
      cardExpire: bank?.cardExpire || '',
      cardNumber: bank?.cardNumber || '',
      cardType: bank?.cardType || '',
      currency: bank?.currency || '',
      iban: bank?.iban || '',
    },
    company: {
      department: company?.department || '',
      name: company?.name || '',
      title: company?.title || '',
      address: {
        address: company?.address?.address || '',
        city: company?.address?.city || '',
        state: company?.address?.state || '',
        stateCode: company?.address?.stateCode || '',
        postalCode: company?.address?.postalCode || '',
        coordinates: {
          lat: company?.address?.coordinates?.lat || null,
          lng: company?.address?.coordinates?.lng || null,
        },
        country: company?.address?.country || '',
      },
    },
    ein,
    ssn,
    userAgent,
    crypto: {
      coin: crypto?.coin || '',
      wallet: crypto?.wallet || '',
      network: crypto?.network || '',
    },
    role,
  };

  return newUser;
};

// update user by id
export const updateUserById = ({ id, ...data }) => {
  const user = verifyUserHandler(id);

  const {
    firstName = user.firstName,
    lastName = user.lastName,
    maidenName = user.maidenName,
    age = user.age,
    gender = user.gender,
    email = user.email,
    phone = user.phone,
    username = user.username,
    password = user.password,
    birthDate = user.birthDate,
    image = user.image,
    bloodGroup = user.bloodGroup,
    height = user.height,
    weight = user.weight,
    eyeColor = user.eyeColor,
    hair = user.hair,
    ip = user.ip,
    address = user.address,
    macAddress = user.macAddress,
    university = user.university,
    bank = user.bank,
    company = user.company,
    ein = user.ein,
    ssn = user.ssn,
    userAgent = user.userAgent,
    crypto = user.crypto,
    role = user.role,
  } = data;

  const updatedUser = {
    id: +id, // converting id to number
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
    hair: {
      color: hair.color || user.hair.color,
      type: hair.type || user.hair.type,
    },
    ip,
    address: {
      address: address?.address || user.address.address,
      city: address?.city || user.address.city,
      state: address?.state || user.address.state,
      stateCode: address?.stateCode || user.address.stateCode,
      postalCode: address?.postalCode || user.address.postalCode,
      coordinates: {
        lat: address?.coordinates?.lat || user.address.coordinates.lat,
        lng: address?.coordinates?.lng || user.address.coordinates.lng,
      },
      country: address?.country || user.address.country,
    },
    macAddress,
    university,
    bank: {
      cardExpire: bank?.cardExpire || user.bank.cardExpire,
      cardNumber: bank?.cardNumber || user.bank.cardNumber,
      cardType: bank?.cardType || user.bank.cardType,
      currency: bank?.currency || user.bank.currency,
      iban: bank?.iban || user.bank.iban,
    },
    company: {
      department: company?.department || user.company.department,
      name: company?.name || user.company.name,
      title: company?.title || user.company.title,
      address: {
        address: company?.address?.address || user.company.address.address,
        city: company?.address?.city || user.company.address.city,
        state: company?.address?.state || user.company.address.state,
        stateCode: company?.address?.stateCode || user.company.address.stateCode,
        postalCode: company?.address?.postalCode || user.company.address.postalCode,
        coordinates: {
          lat: company?.address?.coordinates?.lat || user.company.address.coordinates.lat,
          lng: company?.address?.coordinates?.lng || user.company.address.coordinates.lng,
        },
        country: company?.address?.country || user.company.address.country,
      },
    },
    ein,
    ssn,
    userAgent,
    crypto: {
      coin: crypto?.coin || user.crypto.coin,
      wallet: crypto?.wallet || user.crypto.wallet,
      network: crypto?.network || user.crypto.network,
    },
    role,
  };

  return updatedUser;
};

// delete user by id
export const deleteUserById = ({ id }) => {
  const { ...user } = verifyUserHandler(id);

  user.isDeleted = true;
  user.deletedOn = new Date().toISOString();

  return user;
};
