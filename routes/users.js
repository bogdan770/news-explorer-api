const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getUser } = require('../controllers/user');
const auth = require('../middleware/auth');

router.get(
  '/users/me',
  celebrate({
    headers: Joi.object()
      .keys({
        authorization: Joi.string().required(),
      })
      .unknown(true),
  }),

  auth,
  getUser,
);

module.exports = router;
