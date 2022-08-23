const DocumentNotFoundError = () => {
  const error = new Error('No available data to display');
  error.name = 'Not Found';
  error.statusCode = 404;
  throw error;
};

module.exports = {
  DocumentNotFoundError,
};
