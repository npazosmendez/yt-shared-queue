import express from 'express';
import { Queue, QueueState } from '../model/queue';
import { Video } from '../model/video';
var router = express.Router();

router.put('/', function (req: express.Request, res: express.Response, next: express.RequestHandler) {
  var q = new Queue();
  res.send(JSON.stringify({
    'id': q.id,
  }));
})

router.post('/:id/push', async function (req: express.Request, res: express.Response, next: express.NextFunction) {
  console.log(req.body);
  const queueId = req.params.id;
  const videoUrl = req.body.url;
  const q = Queue.get(queueId);
  if (q && videoUrl) {
    q.pushVideoByUrl(videoUrl)
      .then(() => res.send("ok"))
      .catch(next);
  } else {
    res.sendStatus(404);
  }
});

router.get('/:id', function(req : express.Request, res : express.Response, next : express.RequestHandler) {
  const queueId = req.params.id;
  const q = Queue.get(queueId);
  if (q) {
    res.render('queue', {'queueId': queueId});
  } else {
    res.render('error', {
      'error': {
        'status': 404,
        'stack': ''
      },
      'message': `Queue ${queueId} does not exist`
    });
  }
});


var uuid = 1; // TODO: if I keep this, use uuid lib
router.get('/:id/state', async function (req: express.Request, res: express.Response, next: express.NextFunction) {
  const queueId = req.params.id;
  const q = Queue.get(queueId);
  if (q) {
    console.log(`New connection to queue ${queueId}`)
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    })
    var id = (++uuid).toString();
    var sendState = (state: QueueState) => {
      console.log(`Sending queue ${queueId} update to ${id}`)
      res.write("data: " + JSON.stringify(state) + "\n\n")
    }

    req.on('close', () => {
      console.log(`Connection closed for ${id} on queue ${queueId}`)
      q.removeObserver(id);
      res.end();
    });

    q.addObserver(id, sendState);
    sendState(q.getState());

  } else {
    console.log(`Unknown queue '${queueId}`)
    res.sendStatus(404);
  }
});

router.put('/:id/remove-video/:video', async function (req: express.Request, res: express.Response, next: express.NextFunction) {
  const queueId = req.params.id;
  const q = Queue.get(queueId);
  if (q) {
    const videoId = parseInt(req.params.video, 10);
    if (Number.isNaN(videoId)) {
      console.log(`Bad videoId=${req.params.video}`);
      res.sendStatus(400);
      return
    }

    if (q.removeVideo(videoId)) {
      res.sendStatus(200);
    } else {
      res.sendStatus(410);
    }

  } else {
    console.log(`Unknown queue '${queueId}`)
    res.sendStatus(404);
  }
});

module.exports = router;
