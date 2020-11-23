const PromisePolyfill = require('./index');

new PromisePolyfill((resolve, reject) => {
  console.log(2);
  resolve();
})
.then(() => {
  console.log(7);
  return {
    then: (a, b) => {
      console.log('then');
      console.log(a());
      console.log(b());
    }
  };
})
