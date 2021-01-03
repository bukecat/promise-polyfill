class PromisePolyfill {
  constructor(executor) {
    this.state = 'pending';

    this.value = undefined;
    this.reason = undefined;

    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];

    let resolve = value => {
      console.log(3);
      if (this.state === 'pending') {
        console.log(4);
        this.state = 'fulfilled';

        this.value = value;

        this.onResolvedCallbacks.forEach(fn => fn());
      }
    };

    let reject = reason => {
      if (this.state === 'pending') {
        this.state = 'rejected';

        this.reason = reason;

        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      console.log(1);
      executor(resolve, reject)
    } catch (err) {
      reject(err);
    }
  }


  then(onFulfilled, onRejected) {
    console.log(5);
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };

    let promise2 = new PromisePolyfill((resolve, reject) => {
      if (this.state === 'pending') {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          })
        })

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          })
        })
      }

      if (this.state === 'fulfilled') {
        console.log(6);
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        })
      }

      if (this.state === 'rejected') {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        })
      }
    });

    return promise2;
  }

  static resolve(item) {
    if (item instanceof PromisePolyfill) {
      return item;
    }

    return new PromisePolyfill((_resolve) => {
      _resolve(item);
    });
  }

  static all(arr) {
    const result = [];
    let count = 0
    return new PromisePolyfill((_resolve, _reject) => {
      arr.forEach((item, index) => {
        PromisePolyfill.resolve(item).then((val) => {
          result[index] = val;
          count++;
          if (index === arr.length) {
            _resolve(result)
          }
        }, (e) => {
          _reject(e);
        })
      })
    })
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise'));
  }

  let called;

  if (x != null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      let then = x.then;

      if (typeof then === 'function') {
        then.call(x, y => {
          if (called) {
            return;
          }
          called = true;
          resolvePromise(promise2, y, resolve, reject);
        }, err => {
          if (called) {
            return;
          }
          called = true;
        })
      } else {
        resolve(x);
      }
    } catch (e) {
      if (called) {
        return;
      }
      called = true;
      reject(e);
    }
  } else {
    console.log(8);
    resolve(x);
  }
}

module.exports = PromisePolyfill;




















