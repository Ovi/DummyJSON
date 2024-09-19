const fs = require('node:fs');
const sharp = require('sharp');
const {
  getRandomNumberBetween,
  getRandomNumberFloatBetween,
  getRandomFromArray: fromArr,
  generateRandomBarcode,
  encodeURLSpaces,
} = require('../utils');
const {
  warranties,
  shippingTimes,
  returnPolicies,
  randomPositiveComments,
  randomNegativeComments,
} = require('./constants');

function generateData() {
  try {
    const data = fs.readFileSync('./raw/products/products.json', 'utf8');
    const json = JSON.parse(data);

    const usersData = fs.readFileSync('./database/users.json', 'utf8');
    const users = JSON.parse(usersData);

    const newData = json.map((item, idx) => {
      const baseStock = getRandomNumberBetween(0, 100);

      let stock = baseStock;
      let availabilityStatus = stock > 0 ? 'In Stock' : 'Out of Stock';

      if (baseStock < 3) {
        stock = 0;
        availabilityStatus = 'Out of Stock';
      } else if (baseStock < 7) {
        stock = getRandomNumberBetween(1, 7);
        availabilityStatus = 'Low Stock';
      }

      const images = getProductImages(item);
      generateThumbnailImage(item);

      return {
        id: idx + 1,
        title: item.title,
        description: item.description,
        category: item.category,
        price: item.price,
        discountPercentage: getRandomNumberFloatBetween(0, 20),
        rating: getRandomNumberFloatBetween(2.5, 5),
        stock,
        tags: item.tags.map(tag => tag.toLowerCase()),
        brand: item.brand,
        sku: generateRandomSKU(),
        weight: getRandomNumberBetween(1, 10),
        dimensions: {
          width: getRandomNumberFloatBetween(5, 30),
          height: getRandomNumberFloatBetween(5, 30),
          depth: getRandomNumberFloatBetween(5, 30),
        },
        warrantyInformation: fromArr(warranties),
        shippingInformation: fromArr(shippingTimes),
        availabilityStatus,
        reviews: generateRandomReviews(users),
        returnPolicy: fromArr(returnPolicies),
        minimumOrderQuantity: getMOQ(item.price),
        meta: {
          createdAt: new Date(),
          updatedAt: new Date(),
          barcode: generateRandomBarcode(),
          qrCode: 'https://assets.dummyjson.com/public/qr-code.png',
        },
        images,
        thumbnail: encodeURLSpaces(
          `https://cdn.dummyjson.com/products/images/${item.category}/${item.title}/thumbnail.png`,
        ),
      };
    });

    fs.writeFileSync('./database/products.json', JSON.stringify(newData, null, 2), 'utf8');
    console.log('Data Generated Successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

generateData();

function generateRandomSKU() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function generateRandomReviews(users, length = 3) {
  const reviews = [];

  for (let i = 0; i < length; i++) {
    const user = fromArr(users);

    const isPositive = Math.random() < 0.7;
    const comment = isPositive ? fromArr(randomPositiveComments) : fromArr(randomNegativeComments);

    const rating = isPositive ? getRandomNumberBetween(4, 5) : getRandomNumberBetween(1, 3);

    reviews.push({
      rating,
      comment,
      date: new Date(),
      reviewerName: `${user.firstName} ${user.lastName || user.maidenName || ''}`,
      reviewerEmail: user.email,
    });
  }

  return reviews;
}

function getMOQ(price) {
  if (price > 1000) {
    return 1;
  }

  if (price > 500) {
    return getRandomNumberBetween(1, 2);
  }

  if (price > 100) {
    return getRandomNumberBetween(1, 5);
  }

  if (price > 50) {
    return getRandomNumberBetween(1, 10);
  }

  if (price > 20) {
    return getRandomNumberBetween(1, 20);
  }

  return getRandomNumberBetween(1, 50);
}

function getProductImages(product) {
  const dir = `./dist/images/${product.category}/${product.title}`;
  if (!fs.existsSync(dir)) {
    return [];
  }

  const folder = fs.readdirSync(dir);
  return folder
    .map(file => {
      return encodeURLSpaces(
        `https://cdn.dummyjson.com/products/images/${product.category}/${product.title}/${file}`,
      );
    })
    .filter(url => !url.endsWith('thumbnail.png'));
}

function generateThumbnailImage(product) {
  const dir = `./dist/images/${product.category}/${product.title}`;

  if (!fs.existsSync(dir)) {
    return;
  }

  const folder = fs.readdirSync(dir);
  const image = `${dir}/${folder[0]}`;

  const sharpImage = sharp(image);
  const resizedImage = sharpImage.resize({ width: 300, height: 300, fit: 'contain' });
  const pngImage = resizedImage.png();

  if (fs.existsSync(`${dir}/thumbnail.png`)) {
    return;
  }

  pngImage.toFile(`${dir}/thumbnail.png`);
}
