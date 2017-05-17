var express = require('express');
var router = express.Router();

/* GET stream page. */
router.post('/stream', function(req, res, next) {

  res.render('stream', { title: 'Stream' + JSON.stringify(req.body)});
});

/* GET contentsource page. */
router.get('/content', function(req, res, next) {
    res.render('contentsource', { title: 'Content' });
});

module.exports = router;
