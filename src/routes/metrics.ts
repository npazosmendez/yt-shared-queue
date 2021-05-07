import express from 'express';
import { subscriptions, Queue } from '../model/queue';

var router = express.Router();

router.get('/', function (req: express.Request, res: express.Response, next: express.RequestHandler) {
    if(req.query.pw != undefined && req.query.pw == process.env.METRICS_PW) {
        var qq = Object.keys(subscriptions).map(id => Queue.get(id));
        res.json({
            time: Date.now(),
            queuesWithSubscriptions: qq.map(q => q?.getState()),
        })
    } else {
        res.status(401).send("You say?");
    }
});

module.exports = router;
