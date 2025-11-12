import path from 'node:path';
import fs from 'node:fs';
import multer from 'multer';
import { fileURLToPath } from 'node:url';
import { requestWhitelist } from '../constants/index.js';
import { isNumber, dataInMemory } from '../utils/util.js';
import APIError from '../utils/error.js';
import { logError, log } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// verify if we have user id and it's valid
export const verifyUserHandler = id => {
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
export const verifyPostHandler = id => {
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

export const isRequestInWhitelist = req => {
  const url = req.originalUrl || req.url;

  return requestWhitelist.find(u => url.includes(u));
};

// Configure multer to use disk storage for temporary file handling
export const multerInstance = multer({
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

export const deleteMulterTemporaryFiles = async files => {
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
