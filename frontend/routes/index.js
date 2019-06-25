const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {title: 'PizzaMe', page: 'index'});
});

module.exports = router;
