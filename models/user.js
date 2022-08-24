const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const MiddlewareError = require('../middleware/middlewareError');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: 'The "email" must be a valid email address',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    default: 'Bogdan',
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(
  email,
  password,
) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new MiddlewareError('Incorrect email or password', 401);
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new MiddlewareError('Incorrect email or password', 401);
        }
        return user;
      });
    });
};

module.exports = mongoose.model('user', userSchema);
