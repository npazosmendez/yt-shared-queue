import express from 'express';
import path from 'path';
import morgan from 'morgan';
import http from 'http';
import errorHandler from "errorhandler";
import WebSocket from 'ws';
import { connectionHandler } from './websocket/handler';
import dotenv from 'dotenv';

dotenv.config();

var indexRouter = require('./routes/index');
var queueRouter = require('./routes/queue');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', connectionHandler);

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/queue', queueRouter);


// error handler
app.use(function(err : Error, req : express.Request, res : express.Response, next : express.RequestHandler) {
  // set locals, only providing error in development
  console.log(err)
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(500);
  return res.render('error');
});


if (process.env.NODE_ENV === "development") {
    app.use(errorHandler());
}

const port = 8088;

server.listen(port, () => console.log(`http server is listening on http://localhost:${port}`));

export default server;

