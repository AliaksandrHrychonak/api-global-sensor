require('dotenv').config()
const PORT = process.env.PORT || 5000;
const express = require('express');
const helmet = require("helmet");
const { errors } = require('celebrate');
const cors = require('./middlewares/cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose');
const errorMiddleware = require('./middlewares/error-middleware');
const { requestLogger, errorLogger } = require('./middlewares/logger')
const passport = require('passport')
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const router = require('./router');

const app = express()
app.use(cors)
app.use(helmet())
require("./service/passport");

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
   fallbackLng: 'en',
   backend: {
     loadPath: './locales/{{lng}}/translation.json'
   },
   preload: ['en', 'ru']
  })


app.use(middleware.handle(i18next));
app.use(express.json());
app.use(cookieParser());

app.use(passport.initialize())
app.use(requestLogger)

app.use('/public', express.static(__dirname + '/public'));
app.use(router)

app.use(errorLogger)


app.use(errors())
app.use(errorMiddleware);

const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useUnifiedTopology: true,
            useCreateIndex: true,
            useNewUrlParser: true
        })
        app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`))
    } catch (e) {
        console.log(e);
    }
}

start()
