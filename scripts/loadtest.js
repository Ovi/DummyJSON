// ! Important: Disable rate limiting to allow for higher throughput

// install k6 locally: https://k6.io/docs/getting-started/installation
import http from 'k6/http';
import { check, sleep } from 'k6';

// Test stages
export const options = {
  stages: [
    { duration: '30s', target: 500 }, // ramp up to 500 users over 30 seconds
    { duration: '1m', target: 500 }, // stay at 500 users for 1 minute
    { duration: '30s', target: 0 }, // scale down to 0 users in 30 seconds
  ],
  thresholds: {
    http_req_duration: ['p(90)<150'], // 90% of requests should be below 150ms
  },
};

function makeRequest(url, tags) {
  const res = http.get(url, { tags });
  check(res, {
    'status is 200': r => r.status === 200,
  });
}

const imageSizes = [150, 200, 250];
const iconHashes = ['123', '456', '789'];
const imageSize = imageSizes[Math.floor(Math.random() * imageSizes.length)];
const iconHash = iconHashes[Math.floor(Math.random() * iconHashes.length)];

export default function() {
  const urls = [
    { url: 'http://localhost:8888/test', tags: { name: 'Test Endpoint' } },
    { url: 'http://localhost:8888/products', tags: { name: 'Products' } },
    { url: 'http://localhost:8888/carts', tags: { name: 'Carts' } },
    { url: 'http://localhost:8888/recipes', tags: { name: 'Recipes' } },
    { url: 'http://localhost:8888/users', tags: { name: 'Users' } },
    { url: 'http://localhost:8888/posts', tags: { name: 'Posts' } },
    { url: 'http://localhost:8888/comments', tags: { name: 'Comments' } },
    { url: 'http://localhost:8888/todos', tags: { name: 'Todos' } },
    { url: 'http://localhost:8888/quotes', tags: { name: 'Quotes' } },
    { url: `http://localhost:8888/image/${imageSize}x${imageSize}?text=test`, tags: { name: 'Image' } },
    { url: `http://localhost:8888/icon/${iconHash}/150`, tags: { name: 'Icon' } },
  ];

  // Loop through all the URLs and make requests
  urls.forEach(({ url, tags }) => makeRequest(url, tags));

  // Optional: Introduce a sleep between requests to simulate real user delay
  sleep(0.1); // 100ms between requests
}
