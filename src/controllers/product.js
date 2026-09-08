import { dataInMemory as frozenData } from '../utils/util.js';
import { paginateResource, findResourceById, selectFields, markDeleted, nextId } from '../helpers/resource.js';

// get all products
export const getAllProducts = _options => {
  return paginateResource(frozenData.products, 'products', _options);
};

// search products
export const searchProducts = ({ q: searchQuery, ..._options }) => {
  const products = frozenData.products.filter(p => {
    return p.title.toLowerCase().includes(searchQuery) || p.description.toLowerCase().includes(searchQuery);
  });

  return paginateResource(products, 'products', _options);
};

// get product category list
export const getProductCategoryList = () => {
  return frozenData.categoryList;
};

// get product categories
export const getProductCategories = () => {
  return frozenData.categories;
};

// get product by id
export const getProductById = ({ id, select }) => {
  return selectFields(findResourceById('products', id, 'Product'), select);
};

// get products by categoryName
export const getProductsByCategoryName = ({ categoryName = '', ..._options }) => {
  const products = frozenData.products.filter(p => p.category.toLowerCase() === categoryName.toLowerCase());

  return paginateResource(products, 'products', _options);
};

// add new product
export const addNewProduct = ({ ...data }) => {
  const { title, price, discountPercentage, stock, rating, images, thumbnail, description, brand, category } = data;

  const newProduct = {
    id: nextId('products'),
    title,
    price,
    discountPercentage,
    stock,
    rating,
    images,
    thumbnail,
    description,
    brand,
    category,
  };

  return newProduct;
};

// update product by id
export const updateProductById = ({ id, ...data }) => {
  const { title, price, discountPercentage, stock, rating, images, thumbnail, description, brand, category } = data;

  const productFrozen = findResourceById('products', id, 'Product');

  const updatedProduct = {
    id: +id, // converting id to number
    title: title ?? productFrozen.title,
    price: price ?? productFrozen.price,
    discountPercentage: discountPercentage ?? productFrozen.discountPercentage,
    stock: stock ?? productFrozen.stock,
    rating: rating ?? productFrozen.rating,
    images: images ?? productFrozen.images,
    thumbnail: thumbnail ?? productFrozen.thumbnail,
    description: description ?? productFrozen.description,
    brand: brand ?? productFrozen.brand,
    category: category ?? productFrozen.category,
  };

  return updatedProduct;
};

// delete product by id
export const deleteProductById = ({ id }) => {
  return markDeleted(findResourceById('products', id, 'Product'));
};
