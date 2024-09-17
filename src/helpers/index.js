const path = require('node:path');
const fs = require('node:fs');
const multer = require('multer');
const { requestWhitelist } = require('../constants');
const { isNumber, dataInMemory } = require('../utils/util');
const APIError = require('../utils/error');
const { logError, log } = require('./logger');

const helpers = {};

// verify if we have user id and it's valid
helpers.verifyUserHandler = id => {
  const userId = (id || '').toString();

  if (!userId) {
    throw new APIError(`User id is required`, 400);
  }

  if (!isNumber(userId)) {
    throw new APIError(`Invalid user id '${userId}'`, 400);
  }

  // see if we can find the user
  const user = dataInMemory.users.find(u => u.id.toString() === userId);
  if (!user) {
    throw new APIError(`User with id '${userId}' not found`, 404);
  }

  return user;
};

// verify if we have post id and it's valid
helpers.verifyPostHandler = id => {
  const postId = (id || '').toString();

  if (!postId) {
    throw new APIError(`Post id is required`, 400);
  }

  if (!isNumber(postId)) {
    throw new APIError(`Invalid post id '${postId}'`, 400);
  }

  // see if we can find the post
  const post = dataInMemory.posts.find(u => u.id.toString() === postId);
  if (!post) {
    throw new APIError(`Post with id '${postId}' not found`, 404);
  }

  return post;
};

helpers.isRequestInWhitelist = req => {
  const url = req.originalUrl || req.url;

  return requestWhitelist.find(u => url.includes(u));
};

// Configure multer to use disk storage for temporary file handling
helpers.multerInstance = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const tmpDir = path.join(__dirname, '../..', 'tmp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
      cb(null, tmpDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
    files: 5, // Allow up to 5 files
  },
});

helpers.deleteMulterTemporayFiles = async files => {
  if (!files || !files.length) return;

  files.forEach(file => {
    fs.unlink(file.path, unlinkErr => {
      if (unlinkErr) {
        logError(`Error deleting file ${file.path}: ${unlinkErr.message}`, { file, error: unlinkErr });
      } else {
        log(`Deleted file: ${file.path}`);
      }
    });
  });
};

module.exports = helpers;
