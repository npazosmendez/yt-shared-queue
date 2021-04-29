import express from 'express';
import path from 'path';
import morgan from 'morgan';
import http from 'http';
import errorHandler from "errorhandler";
import WebSocket from 'ws';

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {
  ws.send("Hello from Server!");
  console.log('New websocket connection');
  ws.on('message', (message) => {
    console.log('Message from Client: %s', message);
  });
});

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

server.listen(port, () => console.log(`http server is listening on http://localhost:${port}`));

export default server;

