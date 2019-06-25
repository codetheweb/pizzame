const express = require('express');

const router = express.Router();

// GET link account page
router.get('/:linkToken', (req, res, next) => {
  res.render('linkToken', {title: 'Link Accounts', page: 'link'});
});

// POST to link account page
router.post('/:linkToken', (req, res, next) => {
  res.render('linkToken');
});

module.exports = router;
