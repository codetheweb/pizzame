const awsParamStore = require('aws-param-store');
const {User} = require('../lib/models');

module.exports = {
  name: 'unlink',
  description: 'Unlink your Domino\'s account from PizzaMe.',

  async execute(message, _) {
    const discordId = message.author.id;

    // Check if user exists
    const user = await User.findOne({
      where: {discordId}
    });

    if (!user || !user.isLinked) {
      return message.channel.send('You haven\'t linked your account yet.');
    }

    // Delete stored parameter
    await awsParamStore.putParameter(`/user/${discordId}/email`, 'empty', 'SecureString');
    await awsParamStore.putParameter(`/user/${discordId}/password`, 'empty', 'SecureString');

    // Update user document
    await User.update({
      isLinked: false,
      accessToken: ''
    }, {where: {discordId}});

    return message.channel.send('Your account was successfully unlinked.');
  }
};
