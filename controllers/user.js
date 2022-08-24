const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const NotFoundError = require('../errors/notFoundError');
const ConflictError = require('../errors/conflictError');
const BadReqError = require('../errors/badReqError');
const AuthError = require('../errors/authError');

const { NODE_ENV, JWT_SECRET } = process.env;

const OK = 200;

const getUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new NotFoundError('User with this ID was not found');
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
        throw new ConflictError('User already exists');
      } else if (err.name === 'ValidationError') {
        throw new BadReqError('Email and Password are required');
      }
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-secret',
        {
          expiresIn: '7d',
        },
      );
      res.cookie('jwt', token, {
        maxAge: 360000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      })
        .send({ token });
    })
    .catch((err) => {
      if (err.name === 'Error') {
        throw new AuthError(`${err.message}`);
      }
    })
    .catch(next);
};

module.exports = { getUser, createUser, login };
