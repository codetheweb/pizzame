const Discord = require('discord.js');
const {User} = require('../lib/models');
const Dominos = require('../lib/dominos');
const {orderToEnglish} = require('../lib/utils');
const {execute: link} = require('./link');

module.exports = {
  name: 'available',
  description: 'Get available Easy Orders from your profile.',

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

    // Get user's easy orders
    const dominos = new Dominos(user);
    const orders = await dominos.getEasyOrders({accessToken: user.accessToken});

    const response = new Discord.RichEmbed()
      .setColor('#FF2987')
      .setTitle('Available Easy Orders:');

    orders.forEach(order => {
      const description = orderToEnglish(order);

      response.addField(order.easyOrderNickName, description);
    });

    message.channel.send(response);
  }
};
