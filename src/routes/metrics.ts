import express from 'express';
import { subscriptions, Queue } from '../model/queue';

var router = express.Router();

router.get('/', async function (req: express.Request, res: express.Response, next: express.RequestHandler) {
    if(req.query.pw != undefined && req.query.pw == process.env.METRICS_PW) {
        var states = []
        for (var id of Object.keys(subscriptions)) {
            var q = await Queue.get(id)
            if (q) {
                states.push(q.getState());
            }
        } 
        res.json({
            time: Date.now(),
            queuesWithSubscriptions: states,
        })
    } else {
        res.status(401).send("You say?");
    }
});

module.exports = router;
