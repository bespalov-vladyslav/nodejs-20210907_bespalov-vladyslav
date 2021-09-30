const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor({limit, ...options}) {
    super(options);

    this.limit = limit;
    this.store = 0;
  }

  getSizeChunk(chunk) {
    return Buffer.byteLength(chunk);
  }

  canReadMore(sizeChunk) {
    const {store, limit} = this;
    return sizeChunk + store < limit;
  }

  increaseStoreValue(value) {
    this.store += value;
  }

  _transform(chunk, encoding, callback) {
    const sizeChunk = this.getSizeChunk(chunk);
    if (this.canReadMore(sizeChunk)) {
      this.increaseStoreValue(sizeChunk);
      return callback(null, chunk);
    }
    return callback(new LimitExceededError());
  }
}

module.exports = LimitSizeStream;
