import { verifyPostHandler, verifyUserHandler } from '../helpers/index.js';
import APIError from '../utils/error.js';
import { dataInMemory as frozenData, trueTypeOf } from '../utils/util.js';
import { paginateResource, findResourceById, selectFields, markDeleted, nextId } from '../helpers/resource.js';

// get all comments
export const getAllComments = _options => {
  return paginateResource(frozenData.comments, 'comments', _options);
};

// get comment by id
export const getCommentById = ({ id, select }) => {
  return selectFields(findResourceById('comments', id, 'Comment'), select);
};

// get all comments by postId
export const getAllCommentsByPostId = ({ postId, ..._options }) => {
  verifyPostHandler(postId);

  const comments = frozenData.comments.filter(c => c.postId.toString() === postId);

  return paginateResource(comments, 'comments', _options);
};

// add new comment
export const addNewComment = ({ body, postId, userId }) => {
  // verify if we have valid body
  if (!body || trueTypeOf(body) !== 'string') {
    throw new APIError(`Invalid comment body`, 400);
  }

  verifyPostHandler(postId);

  const user = verifyUserHandler(userId);

  const newComment = {
    id: nextId('comments'),
    body,
    postId,
    user: {
      id: user.id,
      username: user.username,
      fullName: `${user.firstName} ${user.lastName}`,
    },
  };

  return newComment;
};

// update comment by id
export const updateCommentById = ({ id, ...data }) => {
  const { body, postId, userId } = data;

  // see if we can find the comment
  const updatedComment = findResourceById('comments', id, 'Comment');

  if (body && trueTypeOf(body) === 'string') {
    updatedComment.body = body;
  }

  if (postId) {
    verifyPostHandler(postId);
    updatedComment.postId = postId;
  }

  if (userId) {
    const user = verifyUserHandler(userId);

    updatedComment.user = {
      id: user.id,
      username: user.username,
      fullName: `${user.firstName} ${user.lastName}`,
    };
  }

  return updatedComment;
};

// delete comment by id
export const deleteCommentById = ({ id }) => {
  return markDeleted(findResourceById('comments', id, 'Comment'));
};
