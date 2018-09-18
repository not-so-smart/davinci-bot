module.exports = {
    name: 'welcomechannel',
    displayName: 'WelcomeChannel',
    description: 'Sets the channel to welcome new members in.',
    aliases: [],
    usage: '<channel>',
    args: true,
    cooldown: 1,
    accessLevel: 3,
    async execute(message, args) {
        if (message.mentions.channels.size) {
            message.client.customShit.welcomeChannel = message.mentions.channels.first().id;
            await message.client.saveConfig();

            message.channel.sendResolve(`{{happy}} Set welcome channel to ${message.mentions.channels.first()}`);
        } else message.channel.sendResolve(`{{sad}} Please mention a valid channel, i.e #general`);
    }
};