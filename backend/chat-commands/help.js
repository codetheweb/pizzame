module.exports = {
  name: 'help',
  description: 'Get usage.',

  execute(message, _) {
    message.channel.send('This is the help message.');
  }
};
