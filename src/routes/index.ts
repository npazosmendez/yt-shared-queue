import express from 'express';
var router = express.Router();

/* GET home page. */
router.get('/', function(req : express.Request, res : express.Response, next : express.RequestHandler) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
