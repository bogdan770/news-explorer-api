const Article = require('../models/article');
const MiddlewareError = require('../middleware/middlewareError');
const DocumentNotFoundError = require('../middleware/error');

const OK = 200;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const SERVER_ERROR = 500;
const badRequsetText = 'Bad request';
const serverErrorText = 'An internal program error has occured';

const createArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  Article.create({
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
    owner: req.user._id,
  })
    .then((articleData) => {
      res.status(OK).send(articleData);
    })

    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new MiddlewareError(badRequsetText, BAD_REQUEST));
      } else {
        return next(new MiddlewareError(serverErrorText, SERVER_ERROR));
      }
      return next(err);
    });
};

const showArticles = (req, res, next) => {
  Article.find({ owner: req.user._id })
    .orFail(() => {
      throw new MiddlewareError('There is no article yet', NOT_FOUND);
    })
    .then((articleData) => {
      res.status(OK).send(articleData);
    })
    .catch(next);
};

const deleteActicle = (req, res) => {
  const articleId = req.params.id;
  Article.findById(articleId)
    .orFail(DocumentNotFoundError)
    .then((article) => {
      if (!article.owner === req.user._id) { res.status(200).send({ message: 'card has been deleted successfully' }); }
    })

    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: `${err.message}` });
        return;
      }
      if (err.name === 'Not Found') {
        res.status(404).send({ message: `${err.message}` });
      }
      res.status(500).send({ message: `${err.message}` });
    });
};

module.exports = { showArticles, createArticle, deleteActicle };
