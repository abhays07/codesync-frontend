const React = require('react');

module.exports = new Proxy({}, {
  get: function getter(target, key) {
    if (key === '__esModule') return true;
    if (key === 'default') return () => React.createElement('svg');
    return () => React.createElement('svg');
  }
});
