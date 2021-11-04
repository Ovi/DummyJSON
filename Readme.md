# DummyJSON

[DummyJSON](https://dummyjson.com) is a free online REST API that you can use whenever you need some placeholder data for your front-end website or single-page application without running any server-side code.
It's awesome for teaching purposes, sample codes, testing, prototyping.

Checkout the detailed docs at [DummyJSON/Docs](https://dummyjson.com/docs/) for samples.

## Why?

Most of the time when we create a front-end application or website for learning or for client, we have to rely on the backend to implement the front-end or if we want to create a simple learning application we have to use hard-coded data, recently I found myself in need of some data.

I didn't like the idea of using some public API because I had the feeling that I was spending more time registering a client and understanding a complex API than focusing on my task.

So I decided to code a simple backend server that solved my problem, and here's DummyJSON.

You can find it running here and are free to use it in your developments and prototypes: https://dummyjson.com.

I hope you will find it useful.

## Features

- No Sign-up/Registration
- Zero-configuration
- Basic and Advanced API
- Resources relationships
- Filters and nested resources
- Supports GET, POST, PUT, PATCH, and DELETE http methods
- HTTP and HTTPS both works just fine
- Compatible with React, Angular, Vue, Ember, and vanilla JavaScript

## Resources

There are 8 resources available for you:

- products https://dummyjson.com/products/
- carts https://dummyjson.com/carts/
- users https://dummyjson.com/users/
- posts https://dummyjson.com/posts/
- comments https://dummyjson.com/comments/
- quotes https://dummyjson.com/quotes/
- todos https://dummyjson.com/todos/
- auth https://dummyjson.com/auth/

## How to

you can fetch data with any kind of methods you know(fetch API, Axios, jquery ajax,...)

### Get all products

```js
fetch('https://dummyjson.com/products')
  .then(res => res.json())
  .then(json => console.log(json));
```

Note: Pagination is also supported

See all the routes: https://dummyjson.com/docs/
