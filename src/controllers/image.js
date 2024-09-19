const APIError = require('../utils/error');
const { verifyImageInCache, storeImgInCache, getCacheKey, composeImage, isInvalidSize } = require('../utils/image');
const { imageMimeTypes, allowedImageTypes } = require('../constants');
const { log } = require('../helpers/logger');

const allowedTypesString = allowedImageTypes.join("', '");

const controller = {};

controller.imageComposer = async imageOptions => {
  const contentType = imageMimeTypes[imageOptions.type];
  const result = { imageBuffer: null, contentType, cacheUrl: null };

  const sizeError = isInvalidSize(imageOptions.height, imageOptions.width);
  if (sizeError) {
    throw new APIError(sizeError);
  }

  if (!allowedImageTypes.includes(imageOptions.type)) {
    const err = `Unknown image type '${imageOptions.type}', expected one of '${allowedTypesString}'`;
    throw new APIError(err);
  }

  const cacheKey = getCacheKey(imageOptions);

  const hasInCache = await verifyImageInCache(cacheKey);

  if (hasInCache) {
    log('Image cache hit', { cacheKey });
    result.cacheUrl = `https://cdn.dummyjson.com/${cacheKey}`;

    return result;
  }

  // log('Image cache miss', { cacheKey });

  const buffer = await composeImage(imageOptions);

  if (!buffer) return result;

  storeImgInCache(buffer, contentType, cacheKey);

  result.imageBuffer = buffer;

  return result;
};

module.exports = controller;
