const {User} = require('../lib/models');
const {getOrderStatus} = require('../lib/dominos');
const {execute: link} = require('./link');

module.exports = {
  name: 'status',
  description: 'Get the status of your in-progress order.',

  async execute(message, _) {
    const discordId = message.author.id;

    // Check if user exists
    const user = await User.findOne({
      where: {discordId}
    });

    if (!user || !user.isLinked) {
      await message.channel.send('You haven\'t linked your account yet.');
      return link(message, _);
    }

    if (!user.isOrderInProgress) {
      return message.channel.send('There isn\'t currently an order in progress.');
    }

    // Get order status
    const orderStatus = await getOrderStatus({phoneNumber: user.phoneNumber});

    return message.channel.send(JSON.stringify(orderStatus));
  }
};
