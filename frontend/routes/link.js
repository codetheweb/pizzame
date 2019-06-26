const express = require('express');
const awsParamStore = require('aws-param-store');
const Dominos = require('../../backend/lib/dominos');
const {User} = require('../../backend/lib/models');

const router = express.Router();

// GET link account page
router.get('/:linkToken', (req, res, _) => {
  res.render('linkToken', {title: 'Link Accounts', page: 'link', linkToken: req.params.linkToken});
});

// POST to link account page
router.post('/:linkToken', async (req, res, _) => {
  const {email, password} = req.body;

  // Attempt to log into Domino's
  let access_token;
  try {
    ({access_token} = await Dominos.login({email, password}));
  } catch (_) {
    // Bad login
    return res.render('linkToken', {title: 'Link Failed', page: 'link', failed: 'failed', linkToken: req.params.linkToken});
  }

  // Get user
  const user = await User.findOne({where: {linkToken: req.params.linkToken}});

  // Put Domino credentials
  await awsParamStore.putParameter(`/user/${user.discordId}/email`, email, 'SecureString');
  await awsParamStore.putParameter(`/user/${user.discordId}/password`, password, 'SecureString');

  // Update local database
  await User.update({
    isLinked: true,
    accessToken: access_token
  }, {
    where: {linkToken: req.params.linkToken}
  });

  res.render('linkToken', {title: 'Link Accounts', page: 'link', succeeded: 'succeeded', linkToken: req.params.linkToken});
});

module.exports = router;
