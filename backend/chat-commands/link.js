const uuidv4 = require('uuid/v4');
const {User} = require('../lib/models');

module.exports = {
  name: 'link',
  description: 'Link your Domino\'s account with PizzaMe. 🔗',

  async execute(message, _) {
    const discordId = message.author.id;

    // Check if user exists
    const user = await User.findOne({
      where: {discordId}
    });

    if (user && user.isLinked) {
      return message.channel.send('You\'ve already linked your account. Order some pizza!');
    }

    // If user doesn't exist or has not linked yet
    // Generate a new linking token
    const linkToken = uuidv4();

    // Update DB
    const userToInsert = {
      discordId,
      linkToken
    };

    if (user === null) {
      await User.create(userToInsert);
    } else {
      await User.update(userToInsert, {where: {discordId}});
    }

    let instructions = 'Please open this website to complete the linking process: ';
    instructions += `${process.env.BASE_URL}/link/${linkToken}.`;

    return message.author.send(instructions, {split: true})
      .then(() => {
        if (message.channel.type === 'dm') {
          return;
        }

        message.reply('I\'ve sent you a DM with further instructions.');
      }).catch(error => {
        console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
        message.reply('It seems like I can\'t DM you! Do you have DMs disabled?');
      });
  }
};
