const path = require('path');
const map = require('object.map');

function config (config) {
  function isPath (key) {
    return key === 'src' || key === 'dest' || key === 'template';
  }

  function pathify (string) {
    return path.resolve(string);
  }

  function pathifyIterator (val, key) {
    if (typeof val === 'string') {
      if (isPath(key)) {
        return pathify(val);
      }
    } else if (typeof val === 'object') {
      if (Array.isArray(val)){
        if (isPath(key)) {
          return val.map(pathify);
        }
        return val.map(pathifyIterator);
      }
      return map(val, pathifyIterator);
    }
    return val;
  }

  return map(config, pathifyIterator);
}


module.exports = config;