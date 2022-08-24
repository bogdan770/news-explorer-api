const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./logs/loggers');
const routes = require('./routes/index');
const limiter = require('./middleware/limiter');

dotenv.config();

const app = express();

const { PORT = 3000, NODE_ENV, DB_ADRESS } = process.env;

app.use(helmet());
app.use(cors());
app.options('*', cors());

mongoose.connect(
  NODE_ENV === 'production' ? DB_ADRESS : 'mongodb://localhost:27017/final_project',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(requestLogger);
app.use(limiter);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Server will crash now');
  }, 0);
});

app.use('/', routes);

app.get('*', (req, res) => {
  res.status(404).send({ message: 'Requested resource not found' });
});

app.use(errorLogger);

app.use(errors());

app.use((err, req, res) => {
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({
    message: statusCode === 500 ? 'An error occurred on the server' : message,
  });
});

app.listen(PORT);
