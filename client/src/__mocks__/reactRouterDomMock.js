const React = require('react');

module.exports = {
  BrowserRouter: ({ children }) => React.createElement('div', null, children),
  Routes: ({ children }) => React.createElement('div', null, children),
  Route: ({ children }) => React.createElement('div', null, children),
  Link: ({ children, to }) => React.createElement('a', { href: to }, children),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
  Navigate: () => null,
};
