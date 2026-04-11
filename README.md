[![Uptime Robot status](https://img.shields.io/uptimerobot/status/m793802954-7f701e85a9b8891f77662c72?label=json-server&style=for-the-badge&)](https://dummyjson.com/test)

# DummyJSON

[DummyJSON](https://dummyjson.com) is a free REST API for generating placeholder JSON data — no setup, no auth, just use it.

📘 Docs: [https://dummyjson.com/docs](https://dummyjson.com/docs)

**New**: Now you can generate your own [custom responses](https://dummyjson.com/custom-response) from DummyJSON, [try it now!](https://dummyjson.com/custom-response)

## Why DummyJSON?

* Skip building a backend just to test UI
* Avoid unreliable or rate-limited public APIs
* Get consistent, structured data instantly
* No configuration required
* Works with any framework
* Supports all HTTP methods
* Great for prototyping, testing, and learning

## How to Fetch Data

Use any method you prefer - fetch API, Axios, jQuery AJAX - it all works seamlessly.

Example:

```js
const res = await fetch('https://dummyjson.com/products');
const json = await res.json();
console.log(json);
```

OR

```js
const response = await axios.get('https://dummyjson.com/products');
console.log(response.data);
```

P.S.: Pagination is supported.

## Resources

* [Products (190+)](https://dummyjson.com/docs/products)
* [Users (200+)](https://dummyjson.com/docs/users)
* [Carts (200+)](https://dummyjson.com/docs/carts)
* [Posts (250+)](https://dummyjson.com/docs/posts)
* [Comments (340+)](https://dummyjson.com/docs/comments)
* [Quotes (1400+)](https://dummyjson.com/docs/quotes)
* [Recipes (50+)](https://dummyjson.com/docs/recipes)
* [Todos (250+)](https://dummyjson.com/docs/todos)
* [Auth](https://dummyjson.com/docs/auth)
* [Custom HTTP Response](https://dummyjson.com/custom-response)
* [Dummy Image Generator](https://dummyjson.com/docs/image)
* [Generate Identicon](https://dummyjson.com/docs/image#image-identicon)
* [Mock HTTP Response](https://dummyjson.com/docs/http)

## Features

* Filtering & search
  [https://dummyjson.com/products/search?q=phone](https://dummyjson.com/products/search?q=phone)

* Pagination
  [https://dummyjson.com/products?limit=10&skip=10](https://dummyjson.com/products?limit=10&skip=10)

* Nested resources
  [https://dummyjson.com/users/1/posts](https://dummyjson.com/users/1/posts)

* Delay responses
  [https://dummyjson.com/products?delay=1000](https://dummyjson.com/products?delay=1000)

---

# Generate identicon

https://dummyjson.com/icon/HASH/SIZE

Example: https://dummyjson.com/icon/abc123/150

![Example](https://dummyjson.com/icon/abc123/150)

---

# Dummy Image Generator

Dummy Image Generator is a simple Node.js service for generating placeholder images with customizable options.

## Usage

You can use the service by making HTTP requests to the following URL:

https://dummyjson.com/image

### Examples

https://dummyjson.com/image/200

![Example](https://dummyjson.com/image/200)

https://dummyjson.com/image/300/da5047/030104?text=Hello+Peter&fontFamily=cookie&fontSize=36

![Example](https://dummyjson.com/image/300/da5047/030104?text=Hello+Peter&fontFamily=cookie&fontSize=36)

## Supported Fonts

- Bitter
- Cairo
- Comfortaa
- Cookie
- Dosis
- Gotham
- Lobster
- Marhey
- Pacifico
- Poppins
- Quicksand
- Qwigley
- Satisfy
- Ubuntu

---

## Contributors

<a href="https://github.com/Ovi/DummyJSON/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Ovi/DummyJSON" />
</a>

---

## License

MIT
