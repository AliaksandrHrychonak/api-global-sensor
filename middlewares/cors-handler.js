const allowedCors = [
  'http://globalsensor.pro',
  'https://globalsensor.pro',
  'https://localhost:3000',
  'http://localhost:3000',
  'http://localhost:5000',
];

module.exports = (req, res, next) => {
  const {
    origin,
  } = req.headers;
  const {
    method,
  } = req;
  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Cross-Origin-Resource-Policy', 'same-site');
    res.header('Cross-Origin-Opener-Policy', 'same-origin')
    res.header('Access-Control-Allow-Credentials', true);
  }

  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
  const requestHeaders = req.headers['access-control-request-headers'];
  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    res.header('Access-Control-Allow-Headers', requestHeaders);
    res.status(200).send({ message: 'OK' });
  }

  return next();
};
