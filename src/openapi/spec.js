import { createRequire } from 'node:module';
import { dataInMemory } from '../utils/util.js';
import { inferSchemaFromSamples, listEnvelopeSchema } from './infer-schema.js';

const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

let cachedSpec = null;

const ref = name => ({ $ref: `#/components/schemas/${name}` });
const paramRef = name => ({ $ref: `#/components/parameters/${name}` });

const jsonContent = (schema, example) => ({
  content: {
    'application/json': { schema, ...(example !== undefined ? { example } : {}) },
  },
});

/**
 * Request-body examples for write operations. Mirrors the snippets on /docs/*.
 * `required` applies to the add route only; PUT/PATCH accept any subset.
 */
const resourceInputs = {
  product: {
    required: [],
    create: { title: 'BMW Pencil', price: 9.99, brand: 'BMW', category: 'stationery' },
    update: { title: 'iPhone Galaxy +1' },
  },
  cart: {
    required: ['userId', 'products'],
    create: {
      userId: 1,
      products: [
        { id: 144, quantity: 4 },
        { id: 98, quantity: 1 },
      ],
    },
    update: { merge: true, products: [{ id: 1, quantity: 1 }] },
  },
  user: {
    required: [],
    create: { firstName: 'Muhammad', lastName: 'Ovi', age: 250 },
    update: { lastName: 'Owais' },
  },
  post: {
    required: ['userId'],
    create: { title: 'I am in love with someone.', userId: 5 },
    update: { title: 'I think I should shift to the moon' },
  },
  comment: {
    required: ['body', 'postId', 'userId'],
    create: { body: 'This makes all sense to me!', postId: 3, userId: 5 },
    update: { body: 'I think I should shift to the moon' },
  },
  todo: {
    required: ['userId'],
    create: { todo: 'Use DummyJSON in the project', completed: false, userId: 5 },
    update: { completed: false },
  },
  recipe: {
    required: [],
    create: { name: 'Tasty Pizza', cuisine: 'Italian', difficulty: 'Easy', servings: 4 },
    update: { name: 'Tasty Pizza' },
  },
};

const anyObject = { type: 'object', additionalProperties: true };

function createBody(Singular, input) {
  if (!input) return { required: true, ...jsonContent(anyObject) };

  const schema = input.required.length
    ? { allOf: [ref(`${Singular}Input`), { required: input.required }] }
    : ref(`${Singular}Input`);

  return {
    required: true,
    description:
      'Fields for the new resource. The response echoes them back with a generated id; nothing is persisted.',
    ...jsonContent(schema, input.create),
  };
}

function updateBody(Singular, input) {
  if (!input) return { required: true, ...jsonContent(anyObject) };

  return {
    required: true,
    description: 'Any subset of fields. Omitted fields keep their current value.',
    ...jsonContent(ref(`${Singular}Input`), input.update),
  };
}

function pickProperties(schema, keys) {
  const properties = {};
  keys.forEach(key => {
    if (schema.properties[key]) properties[key] = schema.properties[key];
  });

  return { type: 'object', properties };
}

function omitProperties(schema, keys) {
  const properties = { ...schema.properties };
  keys.forEach(key => delete properties[key]);

  return { type: 'object', properties };
}

const errorResponse = {
  description: 'Error',
  ...jsonContent(ref('Error')),
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function sharedParameters() {
  return {
    limit: {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', minimum: 0, default: 30 },
      description: 'Items per page. Use 0 to return all items.',
    },
    skip: {
      name: 'skip',
      in: 'query',
      schema: { type: 'integer', minimum: 0, default: 0 },
      description: 'Number of items to skip.',
    },
    select: {
      name: 'select',
      in: 'query',
      schema: { type: 'string' },
      description: 'Comma-separated fields to include (id is always included).',
      example: 'title,price',
    },
    sortBy: {
      name: 'sortBy',
      in: 'query',
      schema: { type: 'string' },
      description: 'Field to sort by.',
      example: 'title',
    },
    order: {
      name: 'order',
      in: 'query',
      schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
      description: 'Sort order.',
    },
    delay: {
      name: 'delay',
      in: 'query',
      schema: { type: 'integer', minimum: 0, maximum: 5000 },
      description: 'Artificial response delay in milliseconds (0–5000).',
    },
    q: {
      name: 'q',
      in: 'query',
      schema: { type: 'string' },
      description: 'Search query.',
      example: 'phone',
    },
    modifiedAfter: {
      name: 'modifiedAfter',
      in: 'query',
      schema: { type: 'string', format: 'date-time' },
      description: 'ISO 8601 date; return items updated after this time.',
    },
    modifiedBefore: {
      name: 'modifiedBefore',
      in: 'query',
      schema: { type: 'string', format: 'date-time' },
      description: 'ISO 8601 date; return items updated before this time.',
    },
    id: {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'integer' },
      description: 'Resource id.',
    },
  };
}

function listParams({ search = false, dateRange = false } = {}) {
  const params = [
    paramRef('limit'),
    paramRef('skip'),
    paramRef('select'),
    paramRef('sortBy'),
    paramRef('order'),
    paramRef('delay'),
  ];

  if (search) params.push(paramRef('q'));
  if (dateRange) {
    params.push(paramRef('modifiedAfter'), paramRef('modifiedBefore'));
  }

  return params;
}

/**
 * Emit standard list / search / :id / add / PUT / PATCH / DELETE paths.
 * Pass `ops` to enable only a subset (defaults to full CRUD without search).
 */
function resourcePaths({
  path,
  name,
  singular,
  tag,
  schemaName,
  search = false,
  dateRange = false,
  create = true,
  update = true,
  remove = true,
  extra = {},
}) {
  const Singular = capitalize(singular);
  const Schema = schemaName || Singular;
  const input = resourceInputs[singular];
  const paths = {};

  paths[path] = {
    get: {
      tags: [tag],
      summary: `Get all ${name}`,
      operationId: `getAll${capitalize(name)}`,
      parameters: listParams({ dateRange }),
      responses: {
        200: {
          description: `Paginated ${name}`,
          ...jsonContent(ref(`${Schema}List`)),
        },
      },
    },
  };

  if (search) {
    paths[`${path}/search`] = {
      get: {
        tags: [tag],
        summary: `Search ${name}`,
        operationId: `search${capitalize(name)}`,
        parameters: listParams({ search: true, dateRange }),
        responses: {
          200: {
            description: `Matching ${name}`,
            ...jsonContent(ref(`${Schema}List`)),
          },
        },
      },
    };
  }

  paths[`${path}/{id}`] = {
    get: {
      tags: [tag],
      summary: `Get a single ${singular}`,
      operationId: `get${Singular}ById`,
      parameters: [paramRef('id'), paramRef('select'), paramRef('delay')],
      responses: {
        200: {
          description: Singular,
          ...jsonContent(ref(Schema)),
        },
        404: errorResponse,
      },
    },
  };

  if (update) {
    paths[`${path}/{id}`].put = {
      tags: [tag],
      summary: `Update a ${singular}`,
      operationId: `update${Singular}`,
      parameters: [paramRef('id'), paramRef('delay')],
      requestBody: updateBody(Singular, input),
      responses: {
        200: {
          description: `Updated ${singular}`,
          ...jsonContent(ref(Schema)),
        },
        404: errorResponse,
      },
    };

    paths[`${path}/{id}`].patch = {
      tags: [tag],
      summary: `Partial update a ${singular}`,
      operationId: `patch${Singular}`,
      parameters: [paramRef('id'), paramRef('delay')],
      requestBody: updateBody(Singular, input),
      responses: {
        200: {
          description: `Updated ${singular}`,
          ...jsonContent(ref(Schema)),
        },
        404: errorResponse,
      },
    };
  }

  if (remove) {
    paths[`${path}/{id}`].delete = {
      tags: [tag],
      summary: `Delete a ${singular}`,
      operationId: `delete${Singular}`,
      parameters: [paramRef('id'), paramRef('delay')],
      responses: {
        200: {
          description: `Deleted ${singular}`,
          ...jsonContent(ref('DeletedResource')),
        },
        404: errorResponse,
      },
    };
  }

  if (create) {
    paths[`${path}/add`] = {
      post: {
        tags: [tag],
        summary: `Add a new ${singular}`,
        operationId: `add${Singular}`,
        parameters: [paramRef('delay')],
        requestBody: createBody(Singular, input),
        responses: {
          201: {
            description: `Created ${singular}`,
            ...jsonContent(ref(Schema)),
          },
        },
      },
    };
  }

  return { ...paths, ...extra };
}

function buildSchemas() {
  const product = inferSchemaFromSamples(dataInMemory.products);
  const cart = inferSchemaFromSamples(dataInMemory.carts);
  const user = inferSchemaFromSamples(dataInMemory.users);
  const post = inferSchemaFromSamples(dataInMemory.posts);
  const comment = inferSchemaFromSamples(dataInMemory.comments);
  const todo = inferSchemaFromSamples(dataInMemory.todos);
  const quote = inferSchemaFromSamples(dataInMemory.quotes);
  const recipe = inferSchemaFromSamples(dataInMemory.recipes);

  // Writable fields per resource; keep in sync with the addNew*/update* controllers.
  const cartItemInput = {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'integer', description: 'Product id', example: 144 },
      quantity: { type: 'integer', minimum: 1, default: 1, example: 4 },
    },
  };

  const inputs = {
    ProductInput: pickProperties(product, [
      'title',
      'description',
      'category',
      'price',
      'discountPercentage',
      'rating',
      'stock',
      'brand',
      'thumbnail',
      'images',
    ]),
    CartInput: {
      type: 'object',
      properties: {
        userId: { type: 'integer', example: 1 },
        products: { type: 'array', items: cartItemInput },
        merge: {
          type: 'boolean',
          default: false,
          description: 'PUT/PATCH only: keep the existing cart products and add the new ones.',
        },
      },
    },
    UserInput: omitProperties(user, ['id']),
    PostInput: pickProperties(post, ['title', 'body', 'userId', 'tags', 'reactions']),
    CommentInput: {
      type: 'object',
      properties: {
        body: { type: 'string', example: 'This makes all sense to me!' },
        postId: { type: 'integer', example: 3 },
        userId: { type: 'integer', example: 5 },
      },
    },
    TodoInput: pickProperties(todo, ['todo', 'completed', 'userId']),
    RecipeInput: pickProperties(recipe, [
      'name',
      'ingredients',
      'instructions',
      'prepTimeMinutes',
      'cookTimeMinutes',
      'servings',
      'difficulty',
      'cuisine',
      'caloriesPerServing',
      'tags',
      'userId',
      'image',
      'rating',
      'reviewCount',
      'mealType',
    ]),
  };

  const authUser = {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      username: { type: 'string', example: 'emilys' },
      email: { type: 'string', example: 'emily.johnson@x.dummyjson.com' },
      firstName: { type: 'string', example: 'Emily' },
      lastName: { type: 'string', example: 'Johnson' },
      gender: { type: 'string', example: 'female' },
      image: { type: 'string', example: 'https://dummyjson.com/icon/emilys/128' },
    },
  };

  return {
    Product: product,
    ProductList: listEnvelopeSchema('products', ref('Product')),
    Cart: cart,
    CartList: listEnvelopeSchema('carts', ref('Cart')),
    User: user,
    UserList: listEnvelopeSchema('users', ref('User')),
    Post: post,
    PostList: listEnvelopeSchema('posts', ref('Post')),
    Comment: comment,
    CommentList: listEnvelopeSchema('comments', ref('Comment')),
    Todo: todo,
    TodoList: listEnvelopeSchema('todos', ref('Todo')),
    Quote: quote,
    QuoteList: listEnvelopeSchema('quotes', ref('Quote')),
    Recipe: recipe,
    RecipeList: listEnvelopeSchema('recipes', ref('Recipe')),
    ...inputs,
    AuthUser: authUser,
    LoginResponse: {
      allOf: [
        ref('AuthUser'),
        {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
      ],
    },
    Tokens: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
    DeletedResource: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        isDeleted: { type: 'boolean', example: true },
        deletedOn: { type: 'string', format: 'date-time' },
      },
      additionalProperties: true,
    },
    Error: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Something went wrong.' },
      },
    },
    ClientInfo: {
      type: 'object',
      properties: {
        ip: { type: 'string', example: '127.0.0.1' },
        userAgent: { type: 'string', example: 'Mozilla/5.0 ...' },
      },
    },
    TestStatus: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        method: { type: 'string', example: 'GET' },
      },
    },
    TotpResponse: {
      type: 'object',
      properties: {
        totp: { type: 'string', example: '123456' },
        expiresIn: { type: 'integer', example: 25 },
        period: { type: 'integer', example: 30 },
      },
    },
    CustomResponseCreate: {
      type: 'object',
      properties: {
        url: { type: 'string', example: 'https://dummyjson.com/c/abc-123' },
      },
    },
    WebhookCreate: {
      type: 'object',
      properties: {
        identifier: { type: 'string' },
        url: { type: 'string', example: 'https://dummyjson.com/webhook/abc' },
        expiresAt: { type: 'string', format: 'date-time' },
      },
    },
    WebhookIngest: {
      type: 'object',
      properties: {
        received: { type: 'boolean', example: true },
        requestId: { type: 'string', format: 'uuid' },
      },
    },
    CategoryList: {
      type: 'array',
      items: { type: 'string' },
      example: dataInMemory.categoryList?.slice(0, 5) || [],
    },
    Category: {
      type: 'object',
      properties: {
        slug: { type: 'string' },
        name: { type: 'string' },
        url: { type: 'string' },
      },
    },
  };
}

function productExtraPaths() {
  return {
    '/products/category-list': {
      get: {
        tags: ['Products'],
        summary: 'Get product category list',
        operationId: 'getProductCategoryList',
        responses: {
          200: {
            description: 'Category name strings',
            ...jsonContent(ref('CategoryList')),
          },
        },
      },
    },
    '/products/categories': {
      get: {
        tags: ['Products'],
        summary: 'Get product categories',
        operationId: 'getProductCategories',
        responses: {
          200: {
            description: 'Category objects with slug and url',
            ...jsonContent({ type: 'array', items: ref('Category') }),
          },
        },
      },
    },
    '/products/category/{categoryName}': {
      get: {
        tags: ['Products'],
        summary: 'Get products by category',
        operationId: 'getProductsByCategory',
        parameters: [
          {
            name: 'categoryName',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'beauty',
          },
          ...listParams({ dateRange: true }),
        ],
        responses: {
          200: {
            description: 'Products in category',
            ...jsonContent(ref('ProductList')),
          },
        },
      },
    },
  };
}

function cartExtraPaths() {
  return {
    '/carts/user/{userId}': {
      get: {
        tags: ['Carts'],
        summary: 'Get carts by user id',
        operationId: 'getCartsByUserId',
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
          ...listParams(),
        ],
        responses: {
          200: {
            description: 'User carts',
            ...jsonContent(ref('CartList')),
          },
        },
      },
    },
  };
}

function userExtraPaths() {
  return {
    '/users/login': {
      post: {
        tags: ['Users'],
        summary: 'Login user (alias of /auth/login)',
        operationId: 'loginUser',
        requestBody: {
          required: true,
          ...jsonContent({
            type: 'object',
            required: ['username', 'password'],
            properties: {
              username: { type: 'string', example: 'emilys' },
              password: { type: 'string', example: 'emilyspass' },
              expiresInMins: { type: 'integer', example: 60 },
            },
          }),
        },
        responses: {
          200: {
            description: 'Login success',
            ...jsonContent(ref('LoginResponse')),
          },
          400: errorResponse,
        },
      },
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get current authenticated user',
        operationId: 'getCurrentUser',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: 'Authenticated user',
            ...jsonContent(ref('User')),
          },
          401: errorResponse,
        },
      },
    },
    '/users/filter': {
      get: {
        tags: ['Users'],
        summary: 'Filter users by key/value',
        operationId: 'filterUsers',
        parameters: [
          {
            name: 'key',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            example: 'gender',
          },
          {
            name: 'value',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            example: 'female',
          },
          ...listParams(),
        ],
        responses: {
          200: {
            description: 'Filtered users',
            ...jsonContent(ref('UserList')),
          },
        },
      },
    },
    '/users/{userId}/carts': {
      get: {
        tags: ['Users'],
        summary: 'Get carts for a user',
        operationId: 'getUserCarts',
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
          paramRef('limit'),
          paramRef('skip'),
          paramRef('delay'),
        ],
        responses: {
          200: {
            description: 'User carts',
            ...jsonContent(ref('CartList')),
          },
          404: errorResponse,
        },
      },
    },
    '/users/{userId}/posts': {
      get: {
        tags: ['Users'],
        summary: 'Get posts for a user',
        operationId: 'getUserPosts',
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
          ...listParams(),
        ],
        responses: {
          200: {
            description: 'User posts',
            ...jsonContent(ref('PostList')),
          },
          404: errorResponse,
        },
      },
    },
    '/users/{userId}/todos': {
      get: {
        tags: ['Users'],
        summary: 'Get todos for a user',
        operationId: 'getUserTodos',
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
          ...listParams(),
        ],
        responses: {
          200: {
            description: 'User todos',
            ...jsonContent(ref('TodoList')),
          },
          404: errorResponse,
        },
      },
    },
  };
}

function postExtraPaths() {
  return {
    '/posts/tag-list': {
      get: {
        tags: ['Posts'],
        summary: 'Get post tag list',
        operationId: 'getPostTagList',
        responses: {
          200: {
            description: 'Tag name strings',
            ...jsonContent({ type: 'array', items: { type: 'string' } }),
          },
        },
      },
    },
    '/posts/tags': {
      get: {
        tags: ['Posts'],
        summary: 'Get post tags',
        operationId: 'getPostTags',
        responses: {
          200: {
            description: 'Tag objects with slug and url',
            ...jsonContent({ type: 'array', items: ref('Category') }),
          },
        },
      },
    },
    '/posts/tag/{tag}': {
      get: {
        tags: ['Posts'],
        summary: 'Get posts by tag',
        operationId: 'getPostsByTag',
        parameters: [
          {
            name: 'tag',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          ...listParams(),
        ],
        responses: {
          200: {
            description: 'Posts with tag',
            ...jsonContent(ref('PostList')),
          },
        },
      },
    },
    '/posts/user/{userId}': {
      get: {
        tags: ['Posts'],
        summary: 'Get posts by user id',
        operationId: 'getPostsByUserId',
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
          ...listParams(),
        ],
        responses: {
          200: {
            description: 'User posts',
            ...jsonContent(ref('PostList')),
          },
        },
      },
    },
    '/posts/{postId}/comments': {
      get: {
        tags: ['Posts'],
        summary: 'Get comments for a post',
        operationId: 'getPostComments',
        parameters: [
          {
            name: 'postId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
          ...listParams(),
        ],
        responses: {
          200: {
            description: 'Post comments',
            ...jsonContent(ref('CommentList')),
          },
        },
      },
    },
  };
}

function commentExtraPaths() {
  return {
    '/comments/post/{postId}': {
      get: {
        tags: ['Comments'],
        summary: 'Get comments by post id',
        operationId: 'getCommentsByPostId',
        parameters: [
          {
            name: 'postId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
          ...listParams(),
        ],
        responses: {
          200: {
            description: 'Comments for post',
            ...jsonContent(ref('CommentList')),
          },
        },
      },
    },
  };
}

function todoExtraPaths() {
  return {
    '/todos/random': {
      get: {
        tags: ['Todos'],
        summary: 'Get a random todo',
        operationId: 'getRandomTodo',
        parameters: [paramRef('delay')],
        responses: {
          200: {
            description: 'Random todo',
            ...jsonContent(ref('Todo')),
          },
        },
      },
    },
    '/todos/random/{length}': {
      get: {
        tags: ['Todos'],
        summary: 'Get random todos',
        operationId: 'getRandomTodos',
        parameters: [
          {
            name: 'length',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1, maximum: 10 },
            description: 'Number of random todos (1–10).',
          },
          paramRef('delay'),
        ],
        responses: {
          200: {
            description: 'Array of random todos',
            ...jsonContent({ type: 'array', items: ref('Todo') }),
          },
        },
      },
    },
    '/todos/user/{userId}': {
      get: {
        tags: ['Todos'],
        summary: 'Get todos by user id',
        operationId: 'getTodosByUserId',
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
          ...listParams(),
        ],
        responses: {
          200: {
            description: 'User todos',
            ...jsonContent(ref('TodoList')),
          },
        },
      },
    },
  };
}

function quoteExtraPaths() {
  return {
    '/quotes/random': {
      get: {
        tags: ['Quotes'],
        summary: 'Get a random quote',
        operationId: 'getRandomQuote',
        parameters: [paramRef('delay')],
        responses: {
          200: {
            description: 'Random quote',
            ...jsonContent(ref('Quote')),
          },
        },
      },
    },
    '/quotes/random/{length}': {
      get: {
        tags: ['Quotes'],
        summary: 'Get random quotes',
        operationId: 'getRandomQuotes',
        parameters: [
          {
            name: 'length',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1, maximum: 10 },
          },
          paramRef('delay'),
        ],
        responses: {
          200: {
            description: 'Array of random quotes',
            ...jsonContent({ type: 'array', items: ref('Quote') }),
          },
        },
      },
    },
  };
}

function recipeExtraPaths() {
  return {
    '/recipes/tags': {
      get: {
        tags: ['Recipes'],
        summary: 'Get recipe tags',
        operationId: 'getRecipeTags',
        responses: {
          200: {
            description: 'Unique recipe tags',
            ...jsonContent({ type: 'array', items: { type: 'string' } }),
          },
        },
      },
    },
    '/recipes/tag/{tag}': {
      get: {
        tags: ['Recipes'],
        summary: 'Get recipes by tag',
        operationId: 'getRecipesByTag',
        parameters: [
          {
            name: 'tag',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          ...listParams(),
        ],
        responses: {
          200: {
            description: 'Recipes with tag',
            ...jsonContent(ref('RecipeList')),
          },
        },
      },
    },
    '/recipes/meal-type/{mealType}': {
      get: {
        tags: ['Recipes'],
        summary: 'Get recipes by meal type',
        operationId: 'getRecipesByMealType',
        parameters: [
          {
            name: 'mealType',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'Dinner',
          },
          ...listParams(),
        ],
        responses: {
          200: {
            description: 'Recipes for meal type',
            ...jsonContent(ref('RecipeList')),
          },
        },
      },
    },
  };
}

function authPaths() {
  return {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive access/refresh tokens',
        operationId: 'authLogin',
        requestBody: {
          required: true,
          ...jsonContent({
            type: 'object',
            required: ['username', 'password'],
            properties: {
              username: { type: 'string', example: 'emilys' },
              password: { type: 'string', example: 'emilyspass' },
              expiresInMins: { type: 'integer', example: 60 },
            },
          }),
        },
        responses: {
          200: {
            description: 'Login success',
            ...jsonContent(ref('LoginResponse')),
          },
          400: errorResponse,
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout and clear auth cookies',
        operationId: 'authLogout',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: 'Logged out',
            ...jsonContent({
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Logged out successfully' },
              },
            }),
          },
          401: errorResponse,
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user',
        operationId: 'authMe',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: 'Authenticated user',
            ...jsonContent(ref('User')),
          },
          401: errorResponse,
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access and refresh tokens',
        operationId: 'authRefresh',
        requestBody: {
          ...jsonContent({
            type: 'object',
            properties: {
              refreshToken: { type: 'string' },
              expiresInMins: { type: 'integer', example: 60 },
            },
          }),
        },
        responses: {
          200: {
            description: 'New tokens',
            ...jsonContent(ref('Tokens')),
          },
          401: errorResponse,
          403: errorResponse,
        },
      },
    },
  };
}

function toolPaths() {
  return {
    '/test': {
      get: {
        tags: ['Test'],
        summary: 'Health / connectivity check',
        operationId: 'testGet',
        responses: {
          200: {
            description: 'OK',
            ...jsonContent(ref('TestStatus')),
          },
        },
      },
      post: {
        tags: ['Test'],
        summary: 'Health check (POST)',
        operationId: 'testPost',
        responses: {
          200: {
            description: 'OK',
            ...jsonContent(ref('TestStatus')),
          },
        },
      },
      put: {
        tags: ['Test'],
        summary: 'Health check (PUT)',
        operationId: 'testPut',
        responses: {
          200: {
            description: 'OK',
            ...jsonContent(ref('TestStatus')),
          },
        },
      },
      patch: {
        tags: ['Test'],
        summary: 'Health check (PATCH)',
        operationId: 'testPatch',
        responses: {
          200: {
            description: 'OK',
            ...jsonContent(ref('TestStatus')),
          },
        },
      },
      delete: {
        tags: ['Test'],
        summary: 'Health check (DELETE)',
        operationId: 'testDelete',
        responses: {
          200: {
            description: 'OK',
            ...jsonContent(ref('TestStatus')),
          },
        },
      },
    },
    '/http/{httpCode}': {
      get: {
        tags: ['HTTP'],
        summary: 'Mock an HTTP status code response',
        operationId: 'mockHttpStatus',
        parameters: [
          {
            name: 'httpCode',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 200,
          },
        ],
        responses: {
          default: {
            description: 'Response with the requested status code',
            ...jsonContent({
              type: 'object',
              properties: {
                status: { type: 'integer' },
                message: { type: 'string' },
              },
            }),
          },
        },
      },
    },
    '/http/{httpCode}/{message}': {
      get: {
        tags: ['HTTP'],
        summary: 'Mock an HTTP status with a custom message',
        operationId: 'mockHttpStatusWithMessage',
        parameters: [
          {
            name: 'httpCode',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
          {
            name: 'message',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          default: {
            description: 'Response with the requested status code',
            ...jsonContent({
              type: 'object',
              properties: {
                status: { type: 'integer' },
                message: { type: 'string' },
              },
            }),
          },
        },
      },
    },
    '/ip': {
      get: {
        tags: ['IP'],
        summary: 'Get client IP and user agent',
        operationId: 'getClientIp',
        responses: {
          200: {
            description: 'Client info',
            ...jsonContent(ref('ClientInfo')),
          },
        },
      },
    },
    '/image/{size}': {
      get: {
        tags: ['Image'],
        summary: 'Generate a placeholder image',
        operationId: 'generateImage',
        description:
          'Optional path segments after size: /image/{size}/{background}/{color}/{type}. Query params `text` and `fontFamily` customize the overlay.',
        parameters: [
          {
            name: 'size',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Width or widthxheight (e.g. 300 or 300x200).',
            example: '300x200',
          },
          {
            name: 'text',
            in: 'query',
            schema: { type: 'string' },
            description: 'Overlay text.',
          },
          {
            name: 'fontFamily',
            in: 'query',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Generated image bytes (or redirect to cached CDN URL)',
            content: {
              'image/png': { schema: { type: 'string', format: 'binary' } },
              'image/jpeg': { schema: { type: 'string', format: 'binary' } },
              'image/webp': { schema: { type: 'string', format: 'binary' } },
            },
          },
        },
      },
    },
    '/icon/{hash}/{size}': {
      get: {
        tags: ['Icon'],
        summary: 'Generate an identicon',
        operationId: 'generateIcon',
        description: 'Hash and size default to DummyJSON and 100 when omitted (`/icon`, `/icon/{hash}`).',
        parameters: [
          {
            name: 'hash',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'emilys',
          },
          {
            name: 'size',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: '128',
          },
          {
            name: 'type',
            in: 'query',
            schema: { type: 'string', enum: ['png', 'svg'], default: 'png' },
          },
        ],
        responses: {
          200: {
            description: 'Identicon image',
            content: {
              'image/png': { schema: { type: 'string', format: 'binary' } },
              'image/svg+xml': { schema: { type: 'string', format: 'binary' } },
            },
          },
        },
      },
    },
    '/c/generate': {
      post: {
        tags: ['Custom Response'],
        summary: 'Create a custom JSON response URL',
        operationId: 'generateCustomResponse',
        requestBody: {
          required: true,
          ...jsonContent(
            {
              type: 'object',
              required: ['json'],
              properties: {
                json: { description: 'Arbitrary JSON payload (max 300kb)' },
                method: {
                  type: 'string',
                  enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                  default: 'GET',
                },
              },
            },
            { json: { message: 'Hello from DummyJSON', items: [1, 2, 3] }, method: 'GET' },
          ),
        },
        responses: {
          200: {
            description: 'Created URL',
            ...jsonContent(ref('CustomResponseCreate')),
          },
          400: errorResponse,
          413: errorResponse,
        },
      },
    },
    '/c/{identifier}': {
      get: {
        tags: ['Custom Response'],
        summary: 'Fetch a custom response by identifier',
        operationId: 'getCustomResponse',
        parameters: [
          {
            name: 'identifier',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Stored JSON payload',
            ...jsonContent({}),
          },
          404: { description: 'Not found' },
        },
      },
    },
    '/2fa': {
      get: {
        tags: ['2FA'],
        summary: 'Generate a TOTP code (query) or render the 2FA tool page',
        operationId: 'generateTotpGet',
        parameters: [
          {
            name: 'key',
            in: 'query',
            schema: { type: 'string' },
            description: 'Base32 secret or otpauth:// URI. When omitted, returns the HTML tool page.',
          },
        ],
        responses: {
          200: {
            description: 'TOTP payload or HTML page',
            content: {
              'application/json': { schema: ref('TotpResponse') },
              'text/html': { schema: { type: 'string' } },
            },
          },
          400: errorResponse,
        },
      },
      post: {
        tags: ['2FA'],
        summary: 'Generate a TOTP code',
        operationId: 'generateTotpPost',
        requestBody: {
          required: true,
          ...jsonContent({
            type: 'object',
            required: ['key'],
            properties: {
              key: { type: 'string', description: 'Base32 secret or otpauth:// URI', example: 'JBSWY3DPEHPK3PXP' },
            },
          }),
        },
        responses: {
          200: {
            description: 'TOTP payload',
            ...jsonContent(ref('TotpResponse')),
          },
          400: errorResponse,
        },
      },
    },
    '/webhook/create': {
      post: {
        tags: ['Webhook'],
        summary: 'Create a temporary webhook inbox',
        operationId: 'createWebhook',
        responses: {
          200: {
            description: 'Webhook created',
            ...jsonContent(ref('WebhookCreate')),
          },
        },
      },
    },
    '/webhook/{identifier}/requests': {
      get: {
        tags: ['Webhook'],
        summary: 'List captured requests for a webhook',
        operationId: 'listWebhookRequests',
        parameters: [
          {
            name: 'identifier',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Captured requests',
            ...jsonContent({
              type: 'object',
              properties: {
                identifier: { type: 'string' },
                expiresAt: { type: 'string', format: 'date-time' },
                requests: { type: 'array', items: { type: 'object' } },
              },
            }),
          },
          404: { description: 'Not found' },
        },
      },
    },
    '/webhook/{identifier}/requests/{requestId}': {
      delete: {
        tags: ['Webhook'],
        summary: 'Delete a captured webhook request',
        operationId: 'deleteWebhookRequest',
        parameters: [
          {
            name: 'identifier',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'requestId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Deleted',
            ...jsonContent({
              type: 'object',
              properties: { deleted: { type: 'boolean', example: true } },
            }),
          },
          404: { description: 'Not found' },
        },
      },
    },
    '/webhook/{identifier}': {
      get: {
        tags: ['Webhook'],
        summary: 'Inspect webhook (HTML) or ingest a GET request',
        operationId: 'getWebhook',
        parameters: [
          {
            name: 'identifier',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'HTML inspector or ingest acknowledgement',
            content: {
              'text/html': { schema: { type: 'string' } },
              'application/json': { schema: ref('WebhookIngest') },
            },
          },
          404: { description: 'Not found' },
        },
      },
      post: {
        tags: ['Webhook'],
        summary: 'Ingest a POST into the webhook inbox',
        operationId: 'ingestWebhookPost',
        parameters: [
          {
            name: 'identifier',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Received',
            ...jsonContent(ref('WebhookIngest')),
          },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['Webhook'],
        summary: 'Ingest a PUT into the webhook inbox',
        operationId: 'ingestWebhookPut',
        parameters: [
          {
            name: 'identifier',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Received',
            ...jsonContent(ref('WebhookIngest')),
          },
          404: { description: 'Not found' },
        },
      },
      patch: {
        tags: ['Webhook'],
        summary: 'Ingest a PATCH into the webhook inbox',
        operationId: 'ingestWebhookPatch',
        parameters: [
          {
            name: 'identifier',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Received',
            ...jsonContent(ref('WebhookIngest')),
          },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Webhook'],
        summary: 'Ingest a DELETE into the webhook inbox',
        operationId: 'ingestWebhookDelete',
        parameters: [
          {
            name: 'identifier',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Received',
            ...jsonContent(ref('WebhookIngest')),
          },
          404: { description: 'Not found' },
        },
      },
    },
  };
}

function buildPaths() {
  return {
    ...resourcePaths({
      path: '/products',
      name: 'products',
      singular: 'product',
      tag: 'Products',
      search: true,
      dateRange: true,
      extra: productExtraPaths(),
    }),
    ...resourcePaths({
      path: '/carts',
      name: 'carts',
      singular: 'cart',
      tag: 'Carts',
      extra: cartExtraPaths(),
    }),
    ...resourcePaths({
      path: '/users',
      name: 'users',
      singular: 'user',
      tag: 'Users',
      search: true,
      extra: userExtraPaths(),
    }),
    ...resourcePaths({
      path: '/posts',
      name: 'posts',
      singular: 'post',
      tag: 'Posts',
      search: true,
      extra: postExtraPaths(),
    }),
    ...resourcePaths({
      path: '/comments',
      name: 'comments',
      singular: 'comment',
      tag: 'Comments',
      extra: commentExtraPaths(),
    }),
    ...resourcePaths({
      path: '/todos',
      name: 'todos',
      singular: 'todo',
      tag: 'Todos',
      extra: todoExtraPaths(),
    }),
    ...resourcePaths({
      path: '/quotes',
      name: 'quotes',
      singular: 'quote',
      tag: 'Quotes',
      create: false,
      update: false,
      remove: false,
      extra: quoteExtraPaths(),
    }),
    ...resourcePaths({
      path: '/recipes',
      name: 'recipes',
      singular: 'recipe',
      tag: 'Recipes',
      search: true,
      extra: recipeExtraPaths(),
    }),
    ...authPaths(),
    ...toolPaths(),
  };
}

function buildSpec() {
  if (!dataInMemory.products?.length) {
    throw new Error('OpenAPI spec requires data to be loaded first (call loadDataInMemory)');
  }

  return {
    openapi: '3.0.3',
    info: {
      title: 'DummyJSON API',
      version,
      description: [
        'Free fake REST API for placeholder JSON data.',
        '',
        'Most resources also accept an authenticated prefix: `GET /auth/{resource}` with a Bearer token',
        '(or `accessToken` cookie) returns the same payload as the public route while simulating a logged-in user.',
        '',
        'Singular aliases work too (`/product` ≡ `/products`, `/user` ≡ `/users`, etc.).',
        '',
        'Human-readable docs: https://dummyjson.com/docs',
      ].join('\n'),
      contact: {
        name: 'DummyJSON',
        url: 'https://dummyjson.com',
      },
      license: {
        name: 'MIT',
        url: 'https://github.com/Ovi/DummyJSON/blob/master/LICENSE',
      },
    },
    servers: [
      {
        url: 'https://dummyjson.com',
        description: 'Production',
      },
    ],
    tags: [
      { name: 'Products', description: 'Product catalog endpoints' },
      { name: 'Carts', description: 'Shopping cart endpoints' },
      { name: 'Users', description: 'User profile endpoints' },
      { name: 'Posts', description: 'Blog post endpoints' },
      { name: 'Comments', description: 'Comment endpoints' },
      { name: 'Todos', description: 'Todo endpoints' },
      { name: 'Quotes', description: 'Quote endpoints' },
      { name: 'Recipes', description: 'Recipe endpoints' },
      { name: 'Auth', description: 'Login, logout, refresh, and current user' },
      { name: 'HTTP', description: 'Mock HTTP status responses' },
      { name: 'Test', description: 'Connectivity / health check' },
      { name: 'Image', description: 'Placeholder image generator' },
      { name: 'Icon', description: 'Identicon generator' },
      { name: 'Custom Response', description: 'Custom JSON response URLs' },
      { name: 'IP', description: 'Client IP helper' },
      { name: '2FA', description: 'TOTP generator' },
      { name: 'Webhook', description: 'Temporary webhook inbox' },
    ],
    // Public by default; protected routes override with bearerAuth / cookieAuth.
    security: [],
    paths: buildPaths(),
    components: {
      parameters: sharedParameters(),
      schemas: buildSchemas(),
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token from /auth/login',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description: 'HttpOnly cookie set by /auth/login',
        },
      },
    },
  };
}

/**
 * Memoized OpenAPI 3.0.3 document. Call after `loadDataInMemory()`.
 */
export function getOpenApiSpec() {
  if (!cachedSpec) {
    cachedSpec = buildSpec();
  }

  return cachedSpec;
}
