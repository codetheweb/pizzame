const Discord = require('discord.js');
const {User} = require('../lib/models');
const Dominos = require('../lib/dominos');
const {orderToEnglish} = require('../lib/utils');
const {execute: link} = require('./link');

module.exports = {
  name: 'me',
  description: 'Order your default Easy Order. 😋',
  usage: '[*carryout* or *delivery*]',

  async execute(message, args) {
    if (args[0] && !['carryout', 'delivery'].includes(args[0])) {
      return message.channel.send('Invalid arguments provided.');
    }

    const discordId = message.author.id;

    // Check if user exists
    const user = await User.findOne({
      where: {discordId}
    });

    if (!user || !user.isLinked) {
      await message.channel.send('You haven\'t linked your account yet.');
      return link(message, args);
    }

    // Get user's easy orders
    const dominos = new Dominos(user);
    const orders = await dominos.getEasyOrders();

    const [defaultOrder] = orders;

    if (args[0] === 'carryout') {
      defaultOrder.order.ServiceMethod = 'Carryout'
    } else if (args[0] === 'delivery') {
      defaultOrder.order.ServiceMethod = 'Delivery';
    }

    // Give feedback on what will be ordered
    const response = new Discord.RichEmbed()
      .setColor('#FF2987')
      .setTitle('You\'re ordering:');

    response.addField(defaultOrder.easyOrderNickName, orderToEnglish(defaultOrder));

    await message.channel.send(response);

    // Order countdown
    let secondsLeft = 8;
    const orderMsg = await message.channel.send(generateOrderMessage(secondsLeft));
    await orderMsg.react('🛑');

    const countdown = setInterval(async () => {
      secondsLeft--;

      if (secondsLeft === 0) {
        return clearInterval(countdown);
      }

      await orderMsg.edit(generateOrderMessage(secondsLeft));
    }, 1000);

    const filter = (reaction, msgUser) => {
      return reaction.emoji.name === '🛑' && msgUser.id === user.discordId;
    };

    try {
      await orderMsg.awaitReactions(filter, {max: 1, time: 8000, errors: ['time']});
      return message.channel.send('You canceled the order. 😞');
    } catch (_) { }

    await message.reply('placing your order... 🍕 🍕 🍕');

    // Place order
    await dominos.placeOrder(defaultOrder);

    const success = await message.reply('your order was placed! Chat `!pizza status` to get status updated.');
    await success.react('🎉');
  }
};

const generateOrderMessage = secondsLeft => {
  return `Ordering the above in **${secondsLeft}** seconds unless you tap the stop sign:`;
};
