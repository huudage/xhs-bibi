'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const path = require('path');
const { resolveStaticPath, createStaticServer, DEMO_ROOT } = require('./static-server.js');

function request(port, requestPath, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, path: requestPath, method }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8'), headers: res.headers }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('根路径映射到 demo/index.html，拒绝跳出目录', () => {
  const indexPath = resolveStaticPath(DEMO_ROOT, '/');
  assert.equal(indexPath, path.join(DEMO_ROOT, 'index.html'));
  assert.equal(resolveStaticPath(DEMO_ROOT, '/market.html'), path.join(DEMO_ROOT, 'market.html'));
  assert.equal(resolveStaticPath(DEMO_ROOT, '/..%2fPRD-AI维度对比.md'), null);
  assert.equal(resolveStaticPath(DEMO_ROOT, '/%2e%2e/%2e%2e/board-A-memory.md'), null);
  assert.equal(resolveStaticPath(DEMO_ROOT, '/assets/../../secrets.txt'), null);
});

test('只提供 demo 内静态文件', async () => {
  const server = createStaticServer({ rootDir: DEMO_ROOT });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  try {
    const home = await request(port, '/');
    assert.equal(home.status, 200);
    assert.match(home.headers['content-type'], /text\/html/);
    assert.match(home.body, /小红书/);

    const css = await request(port, '/assets/style.css');
    assert.equal(css.status, 200);
    assert.match(css.body, /--red:#FF2442/);

    const traversal = await request(port, '/..%2fPRD-AI%E7%BB%B4%E5%BA%A6%E5%AF%B9%E6%AF%94.md');
    assert.notEqual(traversal.status, 200);
    assert.doesNotMatch(traversal.body, /产品目标与范围/);

    const missing = await request(port, '/no-such-page.html');
    assert.equal(missing.status, 404);

    const posted = await request(port, '/', 'POST');
    assert.equal(posted.status, 405);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
