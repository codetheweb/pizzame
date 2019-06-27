const Discord = require('discord.js');
const {User} = require('../lib/models');
const {getEasyOrders} = require('../lib/dominos');
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
    const orders = await getEasyOrders({accessToken: user.accessToken});

    console.log(orders);

    const response = new Discord.RichEmbed()
      .setColor('#FF2987')
      .setTitle('Available Easy Orders:');

    orders.forEach(order => {
      let description = '';

      order.order.Products.forEach(product => {
        description += ' - ' + product.name;

        if (product.descriptions[0] && product.descriptions[0].value) {
          description += ' with ' + product.descriptions[0].value;
        }

        description += '\n';
      });

      description += '\n';

      if (order.order.ServiceMethod === 'Delivery') {
        description += `**Delivering** to your address starting with **${order.order.Address.StreetNumber}**, `;
      } else {
        description += `Ordering **carryout** from the store at ${order.store.address.Street}, `;
      }

      description += `paying **$${order.order.Amounts.Payment}** with your ${order.order.Payments[0].CardType}.\n`;

      description += `Ready in **${order.order.EstimatedWaitMinutes}** minutes.`;

      response.addField(order.easyOrderNickName, description);
    });

    message.channel.send(response);
  }
};
