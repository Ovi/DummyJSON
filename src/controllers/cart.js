const { verifyUserHandler } = require('../helpers');
const APIError = require('../utils/error');
const { dataInMemory: frozenData, trueTypeOf, isNumber, limitArray } = require('../utils/util');

const controller = {};

// get carts
controller.getAllCarts = ({ limit, skip }) => {
  let [...carts] = frozenData.carts;
  const total = carts.length;

  if (skip > 0) {
    carts = carts.slice(skip);
  }

  carts = limitArray(carts, limit);

  const result = { carts, total, skip, limit: carts.length };

  return result;
};

// get carts by user id
controller.getCartsByUserId = ({ userId, limit, skip }) => {
  verifyUserHandler(userId);

  let [...carts] = frozenData.carts.filter(c => c.userId.toString() === userId);
  const total = carts.length;

  if (skip > 0) {
    carts = carts.slice(skip);
  }

  carts = limitArray(carts, limit);

  const result = { carts, total, skip, limit: carts.length };

  return result;
};

// get cart by id
controller.getCartById = ({ id }) => {
  const cartFrozen = frozenData.carts.find(c => c.id.toString() === id);

  if (!cartFrozen) {
    throw new APIError(`Cart with id '${id}' not found`, 404);
  }

  return cartFrozen;
};

// add new cart
controller.addNewCart = ({ userId, products = [] }) => {
  verifyUserHandler(userId);

  if (trueTypeOf(products) !== 'array') {
    throw new APIError(`products must be array of objects, containing product id and quantity`, 400);
  }

  if (!products.length) {
    throw new APIError(`products can not be empty`, 400);
  }

  const productIds = [];
  const productQty = [];

  // extract product id and quantity
  products.forEach(p => {
    productIds.push(+(p.id || 0));
    productQty.push(+(p.quantity || 1));
  });

  // get all possible products by ids
  const [...productsByIds] = frozenData.products.filter(p => {
    return productIds.includes(p.id);
  });

  // set variables to count the totals of cart by products
  let total = 0;
  let discountedTotal = 0;
  let totalQuantity = 0;

  // get products in the relevant schema
  const someProducts = productsByIds.map((p, idx) => {
    // get quantity of the product
    const quantity = productQty[idx];

    // total price (price * quantity)
    const priceWithQty = p.price * quantity;

    // apply discount on the product if applicable
    const discountedPrice = Math.round(priceWithQty * ((100 - p.discountPercentage) / 100));

    // update cart variables
    total += priceWithQty;
    discountedTotal += discountedPrice;
    totalQuantity += quantity;

    // set product with correct schema
    return {
      id: p.id,
      title: p.title,
      price: p.price,
      quantity,
      total: priceWithQty,
      discountPercentage: p.discountPercentage,
      discountedPrice,
      thumbnail: p.thumbnail,
    };
  });

  // prepare cart
  const cart = {
    id: frozenData.carts.length + 1,
    products: someProducts,
    total,
    discountedTotal,
    userId: +userId, // converting userId to number
    totalProducts: someProducts.length,
    totalQuantity,
  };

  return cart;
};

// update cart by id
controller.updateCartById = ({ id: cartId, ...data }) => {
  const { userId, products: userProducts = [], merge = false } = data;

  const cartFrozen = frozenData.carts.find(c => c.id.toString() === cartId);

  // verify if we have valid cart id
  if (!cartFrozen) {
    throw new APIError(`Cart with id '${cartId}' not found`, 404);
  }

  if (userId) {
    verifyUserHandler(userId);
  }

  if (trueTypeOf(userProducts) !== 'array') {
    throw new APIError(`products must be array of objects, containing product id and quantity`, 400);
  }

  // set variables to count the totals of cart by products
  let total = 0;
  let discountedTotal = 0;
  let totalQuantity = 0;

  const productsMap = new Map();

  if (merge) {
    cartFrozen.products.forEach(p => {
      const item = frozenData.products.find(({ id }) => +id === +p.id);
      if (item) productsMap.set(p.id, { ...item, ...p });
    });
  }

  // keeping user products after merge so we quantity can be overwritten
  userProducts.forEach(p => {
    const item = frozenData.products.find(({ id }) => +id === +p.id);
    if (item) productsMap.set(p.id, { ...item, ...p });
  });

  const allProducts = [];

  [...productsMap].forEach(([, p]) => {
    // get quantity of the product
    let quantity = 1;
    if (isNumber(p.quantity)) quantity = +p.quantity;

    // total price (price * quantity)
    const priceWithQty = p.price * quantity;

    // apply discount on the product if applicable
    const discountedPrice = Math.round(priceWithQty * ((100 - p.discountPercentage) / 100));

    // update cart variables
    total += priceWithQty;
    discountedTotal += discountedPrice;
    totalQuantity += quantity;

    // set product with correct schema
    allProducts.push({
      id: +p.id,
      title: p.title,
      price: p.price,
      quantity,
      total: priceWithQty,
      discountPercentage: p.discountPercentage,
      discountedPrice,
      thumbnail: p.thumbnail,
    });
  });

  // prepare cart
  const cart = {
    id: +cartId, // converting cartId to number
    products: allProducts,
    total,
    discountedTotal,
    userId: +(userId || cartFrozen.userId), // converting userId to number
    totalProducts: allProducts.length,
    totalQuantity,
  };

  return cart;
};

// delete cart by id
controller.deleteCartById = ({ id }) => {
  const cartFrozen = frozenData.carts.find(c => c.id.toString() === id);

  if (!cartFrozen) {
    throw new APIError(`Cart with id '${id}' not found`, 404);
  }

  const { ...cart } = cartFrozen;

  cart.isDeleted = true;
  cart.deletedOn = new Date().toISOString();

  return cart;
};

module.exports = controller;
