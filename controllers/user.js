const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const MiddlewareError = require('../middleware/middlewareError');

const { NODE_ENV, JWT_SECRET } = process.env;

const OK = 200;
// const BAD_REQUEST = 400;
const BAD_METHOD = 401;
const NOT_FOUND = 404;
const CONFLICT = 409;
const SERVER_ERROR = 500;

const getUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new MiddlewareError('User with this ID was found', NOT_FOUND);
    })
    .then((user) => {
      if (user) {
        res.status(OK).send({ data: user });
      }
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const { email, password, name } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then((user) => {
      res.status(OK).send({ _id: user._id, email: user.email });
    })
    .catch((err) => {
      if (err.name === 'MongoServerError' && err.code === 11000) {
        return next(new MiddlewareError('User already exists', CONFLICT));
      }
      next(new MiddlewareError('An internal program error has occured', SERVER_ERROR));

      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        return next(
          new MiddlewareError('This user does not extist', NOT_FOUND),
        );
      }
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        {
          expiresIn: '7d',
        },
      );
      res.send({ data: user.toJSON(), token });
    })
    .catch(() => next(
      new MiddlewareError('Incorrect email or password', BAD_METHOD),
    ));
};

module.exports = { getUser, createUser, login };
