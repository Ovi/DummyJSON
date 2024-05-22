function getRandomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomNumberFloatBetween(min = 0, max, fixed = 2) {
  return (Math.random() * (max - min) + min).toFixed(fixed) * 1;
}

function getRandomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomBarcode() {
  const characters = '0123456789';
  let result = '';
  for (let i = 0; i < 13; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function encodeURLSpaces(url) {
  return url.replace(/ /g, '%20');
}

module.exports = {
  getRandomNumberBetween,
  getRandomNumberFloatBetween,
  getRandomFromArray,
  generateRandomBarcode,
  encodeURLSpaces,
};
