import express from 'express';
import { Queue, QueueState } from '../model/queue';
import { Video } from '../model/video';
import Context from './context';
var router = express.Router();

function getQueueOr404(req: express.Request, res: express.Response, next: express.NextFunction) {
    const queueId = req.params.queueId;
    const q = Queue.get(queueId);
    if (q) {
        Context.bind(req, q);
        next();
    } else {
        res.locals.message = `No queue '${queueId}'`
        res.status(res.locals.status = 404);
        res.render('error');
    }
}

router.put('/', function (req: express.Request, res: express.Response, next: express.NextFunction) {
    var q = new Queue();
    res.send(JSON.stringify({
        'id': q.id,
    }));
})

router.post('/:queueId/push',
    getQueueOr404,
    async function (req: express.Request, res: express.Response, next: express.NextFunction) {
        const videoId = Video.getIdFromURL(req.body.url);
        if (videoId) {
            const q = Context.get(req).queue;
            q.pushVideoById(videoId)
                .then(() => res.sendStatus(200))
                .catch(next);
        } else {
            res.sendStatus(400);
        }
    }
);

router.get('/:queueId',
    getQueueOr404,
    function (req: express.Request, res: express.Response, next: express.NextFunction) {
        const q = Context.get(req).queue;
        res.render('queue', { 'queueId': q.id });
    }
);


var uuid = 1; // TODO: if I keep this, use uuid lib
router.get('/:queueId/state',
    getQueueOr404,
        async function (req: express.Request, res: express.Response, next: express.NextFunction) {
        const q = Context.get(req).queue;

        console.log(`New connection to queue ${q.id}`)
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        })

        var id = (++uuid).toString();
        var sendState = (state: QueueState) => {
            console.log(`Sending queue ${q.id} update to ${id}`)
            res.write("data: " + JSON.stringify(state) + "\n\n")
        }

        req.on('close', () => {
            console.log(`Connection closed for ${id} on queue ${q.id}`)
            q.removeObserver(id);
            res.end();
        });

        q.addObserver(id, sendState);
        sendState(q.getState());
    }
);

router.put('/:queueId/remove-video/:video(\\d+)',
    getQueueOr404,
    async function (req: express.Request, res: express.Response, next: express.NextFunction) {
        const q = Context.get(req).queue;
        const videoId = parseInt(req.params.video, 10);
        if (q.removeVideo(videoId)) {
            res.sendStatus(200);
        } else {
            res.sendStatus(410);
        }
    }
);

module.exports = router;
