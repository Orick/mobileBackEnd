const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');


const indexRouter = require('./routes/index');
const notificacionesRouter = require('./routes/notificaciones');
const fotosRouter = require('./routes/fotos');
const sensoresRouter = require('./routes/sensores');
const userRouter = require('./routes/user');
const plantaRouter = require('./routes/planta');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);



//  Orick  Begin //
app.use('/sensores', sensoresRouter);
app.use('/user', userRouter);
//  Orick  End //

//  Aleeh  Begin //
app.use('/notificaciones', notificacionesRouter);
app.use('/planta',plantaRouter);
//  Aleeh  End //

//  BloodRage  Begin //
app.use('/fotos', fotosRouter);
//  BloodRage  End //


// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});


// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;
