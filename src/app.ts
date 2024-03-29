import dotenv from 'dotenv';
dotenv.config();

import './model/store';
import express from 'express';
import path from 'path';
import morgan from 'morgan';
import http from 'http';
import errorHandler from "errorhandler";
import { initStore } from './model/store';
import { exit } from 'process';

process.env.VERSION = 'v0.5.1';

var indexRouter = require('./routes/index');
var queueRouter = require('./routes/queue');
var metricsRouter = require('./routes/metrics');

const app = express();
const server = http.createServer(app);

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req : express.Request, res : express.Response, next : express.NextFunction) {
    res.locals.footer = process.env.VERSION;
    next();
});

app.use('/', indexRouter);
app.use('/queue', queueRouter);
app.use('/metrics', metricsRouter);

app.use(function(err : Error, req : express.Request, res : express.Response, next : express.RequestHandler) {
    console.error(err)
    if (process.env.NODE_ENV === "development") {
        res.locals.message = err.message;
        res.locals.stack = err.stack
    } else {
        res.locals.message = "Something went wrong"
    }

    res.status(res.locals.status = 500);
    return res.render('error');
});

app.use(errorHandler());

const port = process.env.PORT || 8088;

initStore().then(() => {
    server.listen(port, () => console.log(`http server is listening on http://localhost:${port}`));
}).catch((err) => {
    console.error("Could not intialize store", err)
    exit(1)
})

export default server;

