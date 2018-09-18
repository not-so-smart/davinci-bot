module.exports = {
    name: 'ping',
    displayName: 'Ping',
    description: 'Ping!',
    execute(message, args) {
        message.channel.sendResolve('{{happy}} Pong!');
    },
};