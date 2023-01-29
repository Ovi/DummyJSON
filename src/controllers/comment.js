const { verifyPostHandler, verifyUserHandler } = require('../helpers');
const APIError = require('../utils/error');
const {
  dataInMemory: frozenData,
  trueTypeOf,
  limitArray,
} = require('../utils/util');

const controller = {};

// get all comments
controller.getAllComments = ({ limit, skip }) => {
  let [...comments] = frozenData.comments;
  const total = comments.length;

  if (skip > 0) {
    comments = comments.slice(skip);
  }

  comments = limitArray(comments, limit);

  const result = { comments, total, skip, limit: comments.length };

  return result;
};

// get comment by id
controller.getCommentById = ({ id }) => {
  const commentFrozen = frozenData.comments.find(u => u.id.toString() === id);

  if (!commentFrozen) {
    throw new APIError(`Comment with id '${id}' not found`, 404);
  }

  return commentFrozen;
};

// get all comments by postId
controller.getAllCommentsByPostId = ({ postId, limit, skip }) => {
  verifyPostHandler(postId);

  let [...comments] = frozenData.comments.filter(
    c => c.postId.toString() === postId,
  );
  const total = comments.length;

  if (skip > 0) {
    comments = comments.slice(skip);
  }

  comments = limitArray(comments, limit);

  const result = { comments, total, skip, limit: comments.length };

  return result;
};

// add new comment
controller.addNewComment = ({ body, postId, userId }) => {
  // verify if we have valid body
  if (!body || trueTypeOf(body) !== 'string') {
    throw new APIError(`Invalid comment body`, 400);
  }

  verifyPostHandler(postId);

  const user = verifyUserHandler(userId);

  const newComment = {
    id: frozenData.comments.length + 1,
    body,
    postId,
    user: {
      id: user.id,
      username: user.username,
    },
  };

  return newComment;
};

// update comment by id
controller.updateCommentById = ({ id, ...data }) => {
  const { body, postId, userId } = data;

  // see if we can find the comment
  const commentFrozen = frozenData.comments.find(c => c.id.toString() === id);
  if (!commentFrozen) {
    throw new APIError(`Comment with id '${id}' not found`, 404);
  }

  const { ...updatedComment } = commentFrozen;

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
    };
  }

  return updatedComment;
};

// delete comment by id
controller.deleteCommentById = ({ id }) => {
  const commentFrozen = frozenData.comments.find(c => c.id.toString() === id);

  if (!commentFrozen) {
    throw new APIError(`Comment with id '${id}' not found`, 404);
  }

  const { ...comment } = commentFrozen;

  comment.isDeleted = true;
  comment.deletedOn = new Date().toISOString();

  return comment;
};

module.exports = controller;
