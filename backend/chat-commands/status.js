const {User} = require('../lib/models');
const Dominos = require('../lib/dominos');
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
    const dominos = new Dominos(user);
    const orderStatus = await dominos.getOrderStatus({phoneNumber: user.phoneNumber});

    if (!orderStatus) {
      return message.channel.send('There isn\'t currently an order in progress.');
    }

    return message.channel.send(JSON.stringify(orderStatus));
  }
};
