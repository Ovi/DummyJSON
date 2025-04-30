const fs = require('node:fs').promises;
const path = require('node:path');
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

const baseDir = './dist';

async function generateData() {
  try {
    const data = await fs.readFile('./raw/products/products.json', 'utf8');
    const json = JSON.parse(data);

    const usersData = await fs.readFile('./database/users.json', 'utf8');
    const users = JSON.parse(usersData);

    const newDataPromises = json.map(async (item, idx) => {
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

      const id = idx + 1;
      const images = await getProductImages(item);
      const thumbnail = await generateThumbnailImage(item);

      return {
        id,
        title: item.title,
        description: item.description,
        category: item.category,
        price: item.price,
        discountPercentage: getRandomNumberFloatBetween(0, 20),
        rating: getRandomNumberFloatBetween(2.5, 5),
        stock,
        tags: item.tags.map(tag => tag.toLowerCase()),
        brand: item.brand,
        sku: generateSKU(item, id),
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
          qrCode: 'https://cdn.dummyjson.com/public/qr-code.png',
        },
        images,
        thumbnail,
      };
    });

    console.log('Generating data...');

    const newData = await Promise.all(newDataPromises);
    await fs.writeFile('./database/products.json', JSON.stringify(newData, null, 2), 'utf8');

    console.log('Data Generated Successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

/****************************************
 ********** HELPER FUNCTIONS ************
 ****************************************/

function generateSKU(product, id) {
  const padId = id => String(id).padStart(3, '0');

  const category = product.category?.slice(0, 3).toUpperCase() || 'GEN';
  const brand =
    product.brand
      ?.replace(/[^a-zA-Z]/g, '')
      .slice(0, 3)
      .toUpperCase() || 'BRD';

  const keyword =
    product.title
      .split(' ')
      .find(word => word.length > 3) // avoid "the", "for", etc.
      ?.replace(/[^a-zA-Z]/g, '')
      .slice(0, 3)
      .toUpperCase() || 'PRD';

  // category-brand-keyword-id -> GEN-BRD-PRD-001
  return `${category}-${brand}-${keyword}-${padId(id)}`;
}

function slugify(str) {
  return str.toLowerCase().replace(/ /g, '-');
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
  if (price > 1000) return 1;
  if (price > 500) return getRandomNumberBetween(1, 2);
  if (price > 100) return getRandomNumberBetween(1, 5);
  if (price > 50) return getRandomNumberBetween(1, 10);
  if (price > 20) return getRandomNumberBetween(1, 20);
  return getRandomNumberBetween(1, 50);
}

async function getProductImages(product) {
  const originalImagesDir = `/images/${product.category}/${product.title}`;
  const originalDir = path.join(baseDir, originalImagesDir);
  const newImagesDir = `/product-images/${product.category}/${slugify(product.title)}`;
  const newDir = path.join(baseDir, newImagesDir);

  try {
    await fs.access(originalDir);
  } catch {
    return [];
  }

  await fs.mkdir(newDir, { recursive: true });
  const files = await fs.readdir(originalDir);

  const imageUrls = await Promise.all(
    files.map(async file => {
      if (file === 'thumbnail.webp' || !file.match(/\.(jpg|jpeg|png|webp)$/i)) return null;

      const slugifiedFile = slugify(file);
      const webpFile = slugifiedFile.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      const webpPath = path.join(newDir, webpFile);
      const originalPath = path.join(originalDir, file);

      try {
        await fs.access(webpPath);
      } catch {
        try {
          await sharp(originalPath)
            .resize({ width: 1000, height: 1000, fit: 'contain', background: 'transparent' })
            .webp({ quality: 80 })
            .toFile(webpPath);
        } catch (err) {
          console.error(`Error converting ${file} to WebP:`, err);
          return null;
        }
      }

      return encodeURLSpaces(`https://cdn.dummyjson.com${newImagesDir}/${webpFile}`);
    }),
  );

  return imageUrls.filter(Boolean);
}

async function generateThumbnailImage(product) {
  const originalImagesDir = `/images/${product.category}/${product.title}`;
  const originalDir = path.join(baseDir, originalImagesDir);
  const newImagesDir = `/product-images/${product.category}/${slugify(product.title)}`;
  const newDir = path.join(baseDir, newImagesDir);

  try {
    await fs.access(originalDir);
  } catch {
    return;
  }

  await fs.mkdir(newDir, { recursive: true });
  const folder = await fs.readdir(originalDir);
  const firstImage = path.join(originalDir, folder[0]);
  const thumbnailPath = path.join(newDir, 'thumbnail.webp');

  try {
    await fs.access(thumbnailPath);
  } catch {
    try {
      await sharp(firstImage)
        .resize({ width: 300, height: 300, fit: 'contain', background: 'transparent' })
        .webp({ quality: 80 })
        .toFile(thumbnailPath);
    } catch (err) {
      console.error('Thumbnail generation error:', err);
      return;
    }
  }

  return encodeURLSpaces(`https://cdn.dummyjson.com${newImagesDir}/thumbnail.webp`);
}

// Run
generateData();
