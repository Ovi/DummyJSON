const { verifyUserHandler, verifyPostHandler } = require('../helpers');
const {
  dataInMemory: frozenData,
  getMultiObjectSubset,
  getObjectSubset,
  limitArray,
} = require('../utils/util');

const controller = {};

// get all posts
controller.getAllPosts = ({ limit, skip, select }) => {
  let [...posts] = frozenData.posts;
  const total = posts.length;

  if (skip > 0) {
    posts = posts.slice(skip);
  }

  posts = limitArray(posts, limit);

  if (select) {
    posts = getMultiObjectSubset(posts, select);
  }

  const result = { posts, total, skip, limit: posts.length };

  return result;
};

// search posts
controller.searchPosts = ({ limit, skip, select, q: searchQuery }) => {
  let [...posts] = frozenData.posts.filter(p => {
    return p.body.toLowerCase().includes(searchQuery);
  });
  const total = posts.length;

  if (skip > 0) {
    posts = posts.slice(skip);
  }

  posts = limitArray(posts, limit);

  if (select) {
    posts = getMultiObjectSubset(posts, select);
  }

  const result = { posts, total, skip, limit: posts.length };

  return result;
};

// get post by id
controller.getPostById = ({ id, select }) => {
  let { ...post } = verifyPostHandler(id);

  if (select) {
    post = getObjectSubset(post, select);
  }

  return post;
};

// get posts by userId
controller.getPostsByUserId = ({ userId, limit, skip, select }) => {
  verifyUserHandler(userId);

  let [...posts] = frozenData.posts.filter(p => p.userId.toString() === userId);
  const total = posts.length;

  if (skip > 0) {
    posts = posts.slice(skip);
  }

  posts = limitArray(posts, limit);

  if (select) {
    posts = getMultiObjectSubset(posts, select);
  }

  const result = { posts, total, skip, limit: posts.length };

  return result;
};

// add new post
controller.addNewPost = ({ title, body, userId, tags, reactions }) => {
  verifyUserHandler(userId);

  const newPost = {
    id: frozenData.posts.length + 1,
    title,
    body,
    userId,
    tags,
    reactions,
  };

  return newPost;
};

// update post
controller.updatePost = ({ id, ...data }) => {
  const { title, body, userId, tags, reactions } = data;

  const post = verifyPostHandler(id);

  const updatedPost = {
    id: +id, // converting id to number
    title: title || post.title,
    body: body || post.body,
    userId: userId || post.userId,
    tags: tags || post.tags,
    reactions: reactions || post.reactions,
  };

  return updatedPost;
};

// delete post by id
controller.deletePostById = ({ id }) => {
  const { ...post } = verifyPostHandler(id);

  post.isDeleted = true;
  post.deletedOn = new Date().toISOString();

  return post;
};

module.exports = controller;
