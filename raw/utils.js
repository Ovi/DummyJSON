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

// createdAt within the past `pastDays`, updatedAt between createdAt and now
function generateRandomTimestamps(pastDays = 730) {
  const now = Date.now();
  const createdAt = now - getRandomNumberBetween(0, pastDays * 24 * 60 * 60 * 1000);
  const updatedAt = getRandomNumberBetween(createdAt, now);

  return { createdAt: new Date(createdAt).toISOString(), updatedAt: new Date(updatedAt).toISOString() };
}

module.exports = {
  getRandomNumberBetween,
  getRandomNumberFloatBetween,
  getRandomFromArray,
  generateRandomBarcode,
  generateRandomTimestamps,
  encodeURLSpaces,
};
