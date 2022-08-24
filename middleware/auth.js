const { NODE_ENV, JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Authorization Required' });
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(
      token,
      NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-secret',
    );
  } catch (err) {
    return res.status(401).send({ message: 'Authorization Required' });
  }

  req.user = payload;

  return next();
};
