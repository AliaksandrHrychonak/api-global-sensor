require('dotenv').config();

const { NODE_ENV } = process.env;
const { PORT, DB_URL } = NODE_ENV === 'production' ? process.env : require('./utils/config');
const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const errorHandler = require('./middlewares/error-handler');
const corsHandler = require('./middlewares/cors-handler');
const limiterHandler = require('./middlewares/limiter-handler');
const { requestLogger, errorLogger } = require('./middlewares/logger-handler');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(requestLogger);
app.use(limiterHandler);
app.use(helmet());
app.use(corsHandler);

app.use('/public', express.static(path.join(`${__dirname}/public`)));
app.use(routes);

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

const startServer = async () => {
  try {
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    app.listen(PORT, () => console.log(`Server start on http://localhost:${PORT}`));
  } catch (err) {
    console.log(err);
  }
};
startServer();
