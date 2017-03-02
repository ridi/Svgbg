const path = require('path');
const map = require('object.map');

module.exports = function config(options) {
  function isPath(key) {
    return key === 'src' || key === 'dest' || key === 'template';
  }

  function pathify(string) {
    return path.resolve(string);
  }

  function pathifyIterator(val, key) {
    if (typeof val === 'string') {
      return isPath(key) ? pathify(val) : val;
    }
    if (Array.isArray(val)) {
      return isPath(key) ? val.map(pathify) : val.map(pathifyIterator);
    }
    if (typeof val === 'object') {
      return map(val, pathifyIterator);
    }
    return val;
  }

  return map(options, pathifyIterator);
};
