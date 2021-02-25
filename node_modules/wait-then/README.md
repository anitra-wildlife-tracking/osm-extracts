# wait-then

[![GitHub version][github-img]][github-url]
[![NPM Version][npm-img]][npm-url]
[![Coverage Status][coveralls-img]][coveralls-url]

[![Deps][deps-img]][deps-url]
[![Dev Deps][devDeps-img]][deps-url]
[![Peer Deps][peerDeps-img]][deps-url]

[![NPM Downloads][downloads-img]][npm-url]
[![GitHub stars][stars-img]][github-url]
[![GitHub forks][forks-img]][github-url]
[![GitHub issues][issues-img]][github-url]

Utility function that returns a promise that resolves after _x_ ms

```bash
npm install --save wait-then
```

Can be awaited in [async functions](https://ponyfoo.com/articles/understanding-javascript-async-await), or as a yieldable with [co](https://github.com/tj/co) or in [koa](koajs.com).

Basic example:

```javascript
const wait = require('wait-then'),
    timeout = wait.timeout;

wait(2000).then(function() {
    console.log('This is logged after 2 seconds');
});

timeout(2000).catch(e) {
    console.log('This is logged after 2 seconds');
};
```

Example with `Promise.race` for simple timeouts:

```javascript
const timeout = require('wait-then').timeout;

async function getData(key) {
    try {
        await Promise.race(dataLoader(key), timeout(1000));
    } catch (e) {
        console.error(e);
    }
}
```

Basic example with `async function` and `await`:

```javascript
const wait = require('wait-then'),
    timeout = wait.timeout;

(async function () {
    await wait(1000);
    console.log('This is logged after 1 second');
})();

(async function () {
    try {
        await timeout(1000);
    } catch (e) {
        console.log('This is logged after 1 second');
    }
})();
```

Basic example with `co`:

```javascript
const wait = require('wait-then'),
    timeout = wait.timeout,
    co = require('co');

co(function *() {
    yield wait(1000);
    console.log('This is logged after 1 second');
});

co(function *() {
    try {
        yield timeout(1000);
    } catch (e) {
        console.log('This is logged after 1 second');
    }
});
```

The generator function passed into `co`  can be yielded in a middleware in `koa`.

__Note__: This relies on the existence of a global [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) object as defined in the ECMAScript 6 (Harmony) proposal.

How this differs from [`co-sleep`](https://github.com/eugeneware/co-sleep) and [`co-wait`](https://github.com/juliangruber/co-wait) is that both of them use _thunks_, support for which is set to be [deprecated](https://github.com/tj/co#thunks). `wait-then` instead uses _Promises_, which are also [yieldable](https://github.com/tj/co#yieldables).

[npm-img]: http://img.shields.io/npm/v/wait-then.svg
[downloads-img]: http://img.shields.io/npm/dm/wait-then.svg
[npm-url]: https://www.npmjs.org/package/wait-then
[github-img]: https://badge.fury.io/gh/kunalgolani%2Fwait-then.svg
[stars-img]: https://img.shields.io/github/stars/kunalgolani/wait-then.svg
[forks-img]: https://img.shields.io/github/forks/kunalgolani/wait-then.svg
[issues-img]: https://img.shields.io/github/issues-raw/kunalgolani/wait-then.svg
[github-url]: https://github.com/kunalgolani/wait-then
[coveralls-img]: https://coveralls.io/repos/kunalgolani/wait-then/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/r/kunalgolani/wait-then?branch=master
[deps-img]: https://img.shields.io/david/kunalgolani/wait-then.svg
[devDeps-img]: https://img.shields.io/david/dev/kunalgolani/wait-then.svg
[peerDeps-img]: https://img.shields.io/david/peer/kunalgolani/wait-then.svg
[deps-url]: https://github.com/kunalgolani/wait-then/blob/master/package.json