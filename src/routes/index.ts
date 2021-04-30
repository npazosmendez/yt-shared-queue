import express from 'express';
var router = express.Router();

router.get('/', function(req : express.Request, res : express.Response, next : express.RequestHandler) {
  res.render('index', {'footer': process.env.VERSION});
});

module.exports = router;
