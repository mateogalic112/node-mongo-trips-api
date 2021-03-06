const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const sanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests form this IP.',
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use(sanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  /* res.status(404).json({
    status: 'fail',
    message: `Cant find ${req.originalUrl}`,
  });
  next(); */
  /*   const err = new Error(`Cant find ${req.originalUrl}`);
  err.status = 'fail';
  err.statusCode = 404; */

  next(new AppError(`Cant find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
