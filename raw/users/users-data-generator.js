const fs = require('node:fs');
const { getRandomFromArray: fromArr, getRandomNumberFloatBetween, getRandomNumberBetween } = require('../utils');
const {
  bloodGroups,
  eyeColors,
  hairColors,
  hairTypes,
  universities,
  countryCodes,
  streetNames,
  cities,
  stateCodesDic,
  states,
  departments,
  companies,
  titles,
  cardTypes,
  currencyCodes,
  userAgents,
} = require('./constants');

const roles = {
  admin: 5,
  moderator: 10,
};

function generateData() {
  const _usernames = [];

  try {
    const data = fs.readFileSync('./raw/users/users.json', 'utf8');
    const json = JSON.parse(data);

    const newData = json.map((item, idx) => {
      const { firstName, lastName, maidenName } = item;
      let username = generateUsername(firstName, lastName, maidenName);
      if (_usernames.includes(username)) {
        username = generateUsername(firstName, lastName, maidenName, true);
      }
      _usernames.push(username);

      const email = `${firstName}.${lastName}@x.dummyjson.com`.toLowerCase();
      const password = `${username}pass`;

      return {
        ...item,
        id: idx + 1,
        firstName: item.firstName,
        lastName: item.lastName,
        maidenName: item.maidenName,
        age: item.age,
        gender: item.gender,
        email,
        phone: generateFakePhoneNumber(),
        username,
        password,
        birthDate: generateFakeBirthdayFromAge(item.age),
        image: `https://dummyjson.com/icon/${username}/128`,
        bloodGroup: fromArr(bloodGroups),
        height: getRandomNumberFloatBetween(150, 200),
        weight: getRandomNumberFloatBetween(50, 100),
        eyeColor: fromArr(eyeColors),
        hair: {
          color: fromArr(hairColors),
          type: fromArr(hairTypes),
        },
        ip: generateRandomIP(),
        address: generateRandomAddress(),
        macAddress: generateFakeMacAddress(),
        university: fromArr(universities),
        bank: {
          cardExpire: generateCardExpireDate(),
          cardNumber: generateRandomCardNumber(),
          cardType: fromArr(cardTypes),
          currency: fromArr(currencyCodes),
          iban: generateRandomIban(),
        },
        company: generateRandomCompany(),
        ein: generateRandomEIN(),
        ssn: generateRandomSSN(),
        userAgent: fromArr(userAgents),
        crypto: {
          coin: 'Bitcoin',
          wallet: '0xb9fc2fe63b2a6c003f1c324c3bfa53259162181a',
          network: 'Ethereum (ERC20)',
        },
        role: getRole(),
      };
    });

    fs.writeFileSync('./database/users.json', JSON.stringify(newData, null, 2), 'utf8');
    console.log('Data Generated Successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

generateData();

function generateUsername(firstName, lastName, maidenName, flag) {
  return `${firstName}${(maidenName || lastName)[0]}${flag ? 'x' : ''}`.toLowerCase();
}

function generateFakePhoneNumber() {
  let phoneNumber = `${fromArr(countryCodes)} `;

  phoneNumber += `${getRandomNumberBetween(200, 999)}-`;
  phoneNumber += `${getRandomNumberBetween(200, 999)}-`;
  phoneNumber += getRandomNumberBetween(1000, 9999);

  return phoneNumber;
}

function generateFakeBirthdayFromAge(age) {
  const date = new Date();
  const currentYear = date.getFullYear();
  const year = currentYear - age;
  const month = getRandomNumberBetween(1, 12);
  const day = getRandomNumberBetween(1, month === 2 ? 28 : 30);

  return `${year}-${month}-${day}`;
}

function generateRandomAddress() {
  const state = fromArr(states);

  return {
    address: `${getRandomNumberBetween(1, 2000)} ${fromArr(streetNames)}`,
    city: fromArr(cities),
    state,
    stateCode: stateCodesDic[state],
    postalCode: getRandomNumberBetween(10000, 90000).toString(),
    coordinates: {
      lat: getRandomNumberFloatBetween(-90, 90, 6),
      lng: getRandomNumberFloatBetween(-180, 180, 6),
    },
    country: 'United States',
  };
}

function generateRandomCompany() {
  return {
    department: fromArr(departments),
    name: fromArr(companies),
    title: fromArr(titles),
    address: generateRandomAddress(),
  };
}

function generateRandomIP() {
  const ip = Array.from({ length: 4 }, () => getRandomNumberBetween(0, 255)).join('.');
  return ip;
}

function generateFakeMacAddress() {
  const mac = Array.from({ length: 6 }, () => getRandomNumberBetween(0, 255).toString(16)).join(':');
  return mac;
}

function generateRandomCardNumber() {
  const characters = '0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += characters.charAt(getRandomNumberBetween(0, characters.length - 1));
  }
  return result;
}

function generateRandomIban() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 24; i++) {
    result += characters.charAt(getRandomNumberBetween(0, characters.length - 1));
  }
  return result;
}

function generateCardExpireDate() {
  const date = new Date();
  const year = date.getFullYear() + getRandomNumberBetween(1, 5);
  const month = getRandomNumberBetween(1, 5);

  return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
}

function generateRandomSSN() {
  const ssn = Array.from({ length: 3 }, () =>
    getRandomNumberBetween(100, 999)
      .toString()
      .padStart(3, '0'),
  ).join('-');
  return ssn;
}

function generateRandomEIN() {
  const ein = Array.from({ length: 2 }, () =>
    getRandomNumberBetween(100, 999)
      .toString()
      .padStart(2, '0'),
  ).join('-');
  return ein;
}

function getRole() {
  if (roles.admin > 0) {
    roles.admin -= 1;
    return 'admin';
  }

  if (roles.moderator > 0) {
    roles.moderator -= 1;
    return 'moderator';
  }

  return 'user';
}
