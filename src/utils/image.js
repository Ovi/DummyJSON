/* eslint-disable no-console */
import { createHash } from 'node:crypto';
import colorConvert from 'color-convert';
import sharp from 'sharp';
import { isNumber } from './util.js';
import { verifyInStorage, getFromStorage, uploadToStorage, deleteFolderFromStorage } from '../aws/aws.js';
import { logError, log } from '../helpers/logger.js';

const { CACHE_ENABLED } = process.env;

sharp.cache(false);

export const generateProperData = options => {
  const {
    size,
    background: bg,
    backgroundParam: bgParam,
    color: clr,
    colorParam: clrParam,
    fontFamily: ff,
    fontSize: fs,
    text: txt,
    type: t,
    typeParam: tParam,
  } = options;

  const sizeSplitted = (size || '').split('x');

  // Check if the width is present and a valid number;
  if (!sizeSplitted[0] || !isNumber(sizeSplitted[0])) {
    return null;
  }

  // At this point, 'width' is a valid number
  // If 'size' includes 'x', we can proceed to check the height
  if (sizeSplitted.length === 2 && !isNumber(sizeSplitted[1])) {
    return null;
  }

  // Now, 'width' and 'height' both are valid number
  // We can place an extra check to see if 'size' contains more than one 'x'
  if (sizeSplitted.length > 2) {
    return null;
  }

  const [w, h] = size ? size.split('x') : [150, 150];
  const width = parseInt(w, 10) || 150;
  const height = parseInt(h, 10) || width;
  const background = resolveColor(bg || bgParam || 'cccccc');
  const color = resolveColor(clr || clrParam) || getContrastColor(background);
  const fontFamily = ff || 'bitter';
  const text = txt || `${width} x ${height}`;
  const fontSize = fs || 16;
  const hasSpecifiedFontSize = !!fs;
  const type = t || tParam || 'png';

  return {
    width,
    height,
    background,
    color,
    fontFamily,
    text,
    fontSize,
    hasSpecifiedFontSize,
    type,
  };
};

export const isInvalidSize = (height, width, maxSize = 4000) => {
  if (width === 0 || height === 0) {
    return '👻';
  }

  if (width > maxSize || height > maxSize) {
    return 'Too big to be an image, why not try a smaller size?';
  }

  return false;
};

export const getCustomImageCacheKey = options => {
  const { width, height, background, color, fontFamily, fontSize, text, type } = options;

  const size = `${width}x${height}`;
  const font = `${fontFamily}-${fontSize}`;
  const colors = `${background}-${color}`.replace(/#/g, '');
  const textMd5 = createHash('md5')
    .update(text)
    .digest('hex');

  const key = ['cache', size, font, colors, textMd5].join('/');
  return `${key}.${type}`;
};

/**
 * Generates image with provided options using sharp
 *
 * @param options Image options
 * @param options.width {number} image width
 * @param options.height {number} image height
 * @param options.text {string} image text
 * @param options.type {string} image format/type
 * @param options.fontFamily {string} image text font-family
 * @param options.fontSize {number} image text font-size in pixels
 * @param options.color {string} image text color in hex
 * @param options.background {string} image background color in hex
 * @param options.hasSpecifiedFontSize {boolean} to check if font size if provided by user
 */
export const composeImage = async options => {
  const { width, height, text, type, fontFamily, fontSize, color, background, hasSpecifiedFontSize } = options;

  const image = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  });

  const dynamicFontSize = fontSize && hasSpecifiedFontSize ? parseInt(fontSize, 10) : width / text.length;
  const fontSizeValue = dynamicFontSize || 16;

  const verticalOffset = fontSizeValue / 3; // Adjust this value to fine-tune the vertical centering

  image.composite([
    {
      input: Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${background}" />
    <text x="50%" y="50%" font-family="${fontFamily}" font-size="${fontSizeValue}px" fill="${color}" text-anchor="middle" dy="${verticalOffset}" alignment-baseline="middle">${text}</text>
  </svg>`),
    },
  ]);

  switch (type) {
    case 'png':
      image.png();
      break;
    case 'jpeg':
    case 'jpg':
      image.jpeg();
      break;
    case 'webp':
      image.webp();
      break;
    default:
      image.png();
  }

  const imageBuffer = await image.toBuffer();
  return imageBuffer;
};

export const verifyImageInCache = async imgPath => {
  if (!CACHE_ENABLED) return null;

  const hasInCache = await verifyInStorage(imgPath);
  return hasInCache;
};

export const getImageFromCache = async imgPath => {
  if (!CACHE_ENABLED) return null;

  const cachedImage = await getFromStorage(imgPath);
  return cachedImage;
};

export const storeImgInCache = async (buffer, contentType, key) => {
  if (!CACHE_ENABLED) return null;

  const metadata = await uploadToStorage(buffer, contentType, key);
  if (metadata?.httpStatusCode === 200) {
    log('Image cached', { key });
  } else {
    logError('Image caching failed', { key, metadata });
  }

  return metadata;
};

export const deleteAllCache = async () => {
  if (!CACHE_ENABLED) return null;

  const metadata = await deleteFolderFromStorage('cache');
  return metadata;
};

// Function to resolve color (accepts both color names and hex codes)
function resolveColor(inputColor) {
  try {
    // Check if the input is a valid hex code without hash
    const isHexWithoutHash = /^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(inputColor);

    if (isHexWithoutHash) {
      // Add hash to the hex code
      return `#${inputColor}`;
    }

    // Try to convert color name to hex
    const hexCode = colorConvert.keyword.hex(inputColor);

    // If conversion is successful, return the hex code; otherwise, return null
    return hexCode ? `#${hexCode}` : null;
  } catch (error) {
    return '#000000';
  }
}

// Function to calculate the contrast color for text based on background color
function getContrastColor(bgColor) {
  try {
    // Convert the hex color to RGB
    const [r, g, b] = colorConvert.hex.rgb(bgColor);

    // Calculate the luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Choose black or white as the contrasting color based on luminance
    return luminance > 0.5 ? 'black' : 'white';
  } catch (error) {
    return 'black';
  }
}
