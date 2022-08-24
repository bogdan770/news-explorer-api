const Article = require('../models/article');
const NotFoundError = require('../errors/notFoundError');
const BadReqError = require('../errors/badReqError');
const ForbiddenError = require('../errors/forbError');

const OK = 200;

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
        throw new BadReqError('All inputs are required');
      }
    })
    .catch(next);
};

const showArticles = (req, res, next) => {
  Article.find({ owner: req.user._id })
    .orFail(() => {
      throw new NotFoundError('There is no article yet');
    })
    .then((articleData) => {
      res.status(OK).send(articleData);
    })
    .catch(next);
};

const deleteActicle = (req, res, next) => {
  Article.findById(req.params.articleId)
    .orFail(() => {
      throw new NotFoundError('Article not found');
    })
    .then((articleData) => {
      const UserId = req.user._id.toString();
      const OwnerId = articleData.owner.toString();
      if (UserId === OwnerId) {
        Article.findByIdAndRemove(articleData).then(() => res.send({ articleData }));
      } else if (UserId !== OwnerId) {
        throw new ForbiddenError('Can not delete article of other user');
      } else if (Error.name === 'CastError') {
        throw new BadReqError('Invalid article ID');
      }
    })
    .catch(next);
};

module.exports = { showArticles, createArticle, deleteActicle };
