import { verifyUserHandler, verifyPostHandler } from '../helpers/index.js';
import { dataInMemory as frozenData } from '../utils/util.js';
import { paginateResource, selectFields, markDeleted, nextId } from '../helpers/resource.js';

// get all posts
export const getAllPosts = _options => {
  return paginateResource(frozenData.posts, 'posts', _options);
};

// search posts
export const searchPosts = ({ q: searchQuery, ..._options }) => {
  const posts = frozenData.posts.filter(p => {
    return p.body.toLowerCase().includes(searchQuery);
  });

  return paginateResource(posts, 'posts', _options);
};

// get post tag list
export const getPostTagList = () => {
  return frozenData.tagList;
};

// get post tags
export const getPostTags = () => {
  return frozenData.tags;
};

// get posts by tag
export const getPostsByTag = ({ tag = '', ..._options }) => {
  const posts = frozenData.posts.filter(p => p.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase()));

  return paginateResource(posts, 'posts', _options);
};

// get post by id
export const getPostById = ({ id, select }) => {
  return selectFields({ ...verifyPostHandler(id) }, select);
};

// get posts by userId
export const getPostsByUserId = ({ userId, ..._options }) => {
  verifyUserHandler(userId);

  const posts = frozenData.posts.filter(p => p.userId.toString() === userId);

  return paginateResource(posts, 'posts', _options);
};

// add new post
export const addNewPost = ({ title, body, userId, tags, reactions }) => {
  verifyUserHandler(userId);

  const newPost = {
    id: nextId('posts'),
    title,
    body,
    userId,
    tags,
    reactions,
  };

  return newPost;
};

// update post
export const updatePost = ({ id, ...data }) => {
  const { title, body, userId, tags, reactions } = data;

  const post = verifyPostHandler(id);

  const updatedPost = {
    id: +id, // converting id to number
    title: title ?? post.title,
    body: body ?? post.body,
    userId: userId ?? post.userId,
    tags: tags ?? post.tags,
    reactions: reactions ?? post.reactions,
  };

  return updatedPost;
};

// delete post by id
export const deletePostById = ({ id }) => {
  return markDeleted(verifyPostHandler(id));
};
