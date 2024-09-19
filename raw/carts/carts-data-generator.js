const fs = require('node:fs');
const { getRandomFromArray: fromArr, getRandomNumberBetween } = require('../utils');

function generateData() {
  try {
    const productsData = fs.readFileSync('./database/products.json', 'utf8');
    const products = JSON.parse(productsData);

    const usersData = fs.readFileSync('./database/users.json', 'utf8');
    const users = JSON.parse(usersData);

    const newData = Array.from({ length: 50 }).map((_, idx) => {
      const productsArr = getRandomNumberOfProducts(products, getRandomNumberBetween(2, 6));

      const randomProducts = productsArr.map(product => {
        const { id, title, price, discountPercentage, thumbnail } = product;

        const quantity = getRandomNumberBetween(1, 5);
        const total = product.price * quantity;
        const discountedTotal = (total - (total * discountPercentage) / 100).toFixed(2) * 1;

        return {
          id,
          title,
          price,
          quantity,
          total,
          discountPercentage,
          discountedTotal,
          thumbnail,
        };
      });

      const total = randomProducts.reduce((acc, curr) => acc + curr.total, 0).toFixed(2) * 1;
      const discountedTotal = randomProducts.reduce((acc, curr) => acc + curr.discountedTotal, 0).toFixed(2) * 1;
      const totalProducts = randomProducts.length;
      const totalQuantity = randomProducts.reduce((acc, curr) => acc + curr.quantity, 0);
      const userId = fromArr(users).id;

      return {
        id: idx + 1,
        products: randomProducts,
        total,
        discountedTotal,
        userId,
        totalProducts,
        totalQuantity,
      };
    });

    fs.writeFileSync('./database/carts.json', JSON.stringify(newData, null, 2), 'utf8');
    console.log('Data Generated Successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

generateData();

function getRandomNumberOfProducts(productsArr, length) {
  const products = [];

  while (products.length < length) {
    products.push(fromArr(productsArr));
  }

  return products;
}
