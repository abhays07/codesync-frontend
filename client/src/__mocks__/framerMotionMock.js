const React = require('react');

module.exports = {
  motion: {
    div: ({ children, className }) => React.createElement('div', { className }, children),
    span: ({ children, className }) => React.createElement('span', { className }, children),
    button: ({ children, className }) => React.createElement('button', { className }, children),
    article: ({ children, className }) => React.createElement('article', { className }, children),
  },
  AnimatePresence: ({ children }) => React.createElement('div', null, children),
};
