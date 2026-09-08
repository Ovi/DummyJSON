import { verifyUserHandler } from '../helpers/index.js';
import APIError from '../utils/error.js';
import { dataInMemory as frozenData, trueTypeOf, isNumber } from '../utils/util.js';
import { paginateResource, findResourceById, selectFields, markDeleted, nextId } from '../helpers/resource.js';

// get carts
export const getAllCarts = _options => {
  return paginateResource(frozenData.carts, 'carts', _options);
};

// get carts by user id
export const getCartsByUserId = ({ userId, ..._options }) => {
  verifyUserHandler(userId);

  const carts = frozenData.carts.filter(c => c.userId.toString() === userId);

  return paginateResource(carts, 'carts', _options);
};

// get cart by id
export const getCartById = ({ id, select }) => {
  return selectFields(findResourceById('carts', id, 'Cart'), select);
};

// add new cart
export const addNewCart = ({ userId, products = [] }) => {
  verifyUserHandler(userId);

  if (trueTypeOf(products) !== 'array') {
    throw new APIError(`products must be array of objects, containing product id and quantity`, 400);
  }

  if (!products.length) {
    throw new APIError(`products can not be empty`, 400);
  }

  // quantity per product id, in the caller's order
  const quantityById = new Map();
  products.forEach(p => {
    const productId = +(p.id || 0);
    const quantity = +(p.quantity || 1);
    quantityById.set(productId, (quantityById.get(productId) || 0) + quantity);
  });

  // set variables to count the totals of cart by products
  let total = 0;
  let discountedTotal = 0;
  let totalQuantity = 0;

  const someProducts = [...quantityById].flatMap(([productId, quantity]) => {
    const p = frozenData.products.find(({ id }) => id === productId);
    if (!p) return [];

    // total price (price * quantity)
    const priceWithQty = p.price * quantity;

    // apply discount on the product if applicable
    const discountedPrice = Math.round(priceWithQty * ((100 - p.discountPercentage) / 100));

    // update cart variables
    total += priceWithQty;
    discountedTotal += discountedPrice;
    totalQuantity += quantity;

    // set product with correct schema
    return [
      {
        id: p.id,
        title: p.title,
        price: p.price,
        quantity,
        total: priceWithQty,
        discountPercentage: p.discountPercentage,
        discountedPrice,
        thumbnail: p.thumbnail,
      },
    ];
  });

  // prepare cart
  const cart = {
    id: nextId('carts'),
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
export const updateCartById = ({ id: cartId, ...data }) => {
  const { userId, products: userProducts = [], merge = false } = data;

  const cartFrozen = findResourceById('carts', cartId, 'Cart');

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
export const deleteCartById = ({ id }) => {
  return markDeleted(findResourceById('carts', id, 'Cart'));
};
