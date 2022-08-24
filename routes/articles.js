const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const auth = require('../middleware/auth');

const {
  showArticles,
  createArticle,
  deleteActicle,
} = require('../controllers/articles');

router.get('/articles', auth, showArticles);

router.post(
  '/articles',
  celebrate({
    headers: Joi.object()
      .keys({
        authorization: Joi.string().required(),
      })
      .unknown(true),
    body: Joi.object().keys({
      keyword: Joi.string().required(),
      title: Joi.string().required(),
      text: Joi.string().required(),
      date: Joi.string().required(),
      source: Joi.string().required(),
      link: Joi.string().required().uri(),
      image: Joi.string().required().uri(),
    }),
  }),
  auth,
  createArticle,
);
router.delete(
  '/articles/:articleId',
  celebrate({
    params: Joi.object().keys({
      articleId: Joi.string().length(24).alphanum().required(),
    }),
    headers: Joi.object()
      .keys({
        authorization: Joi.string().required(),
      })
      .unknown(true),
  }),

  auth,
  deleteActicle,
);

module.exports = router;
