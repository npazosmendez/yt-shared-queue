import express from 'express';
var router = express.Router();

/* GET home page. */
router.get('/', function(req : express.Request, res : express.Response, next : express.RequestHandler) {
  res.send('Users new!!');
});

module.exports = router;
