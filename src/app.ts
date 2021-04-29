import express from 'express';
import path from 'path';
import morgan from 'morgan';
import errorHandler from "errorhandler";

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


// error handler
app.use(function(err : Error, req : express.Request, res : express.Response, next : express.RequestHandler) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(500);
  res.render('error');
});



if (process.env.NODE_ENV === "development") {
    app.use(errorHandler());
}

const port = 8088;

const server = app.listen(port, () => {
  console.log(
      "  App is running at http://localhost:%d in %s mode",
      port,
      app.get("env")
  );
  console.log("  Press CTRL-C to stop\n");
});

export default server;

