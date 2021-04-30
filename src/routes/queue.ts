import express from 'express';
import { Queue } from '../model/queue';
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

router.get('/:id', async function (req: express.Request, res: express.Response, next: express.NextFunction) {
  const queueId = req.params.id;
  const q = Queue.get(queueId);
  if (q) {
    res.send(JSON.stringify({
      'id': queueId,
      'currentVideo': q.getCurrentVideoId(),
      'currentTime': q.getCurrentVideoTime(),
    }));
  } else {
    res.sendStatus(404);
  }
});

module.exports = router;
