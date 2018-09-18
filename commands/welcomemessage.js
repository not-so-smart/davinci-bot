module.exports = {
    name: 'welcomemessage',
    displayName: 'WelcomeMessage',
    description: 'Sets the message to be displayed when a new member joins. ([[USER]] == @user)',
    aliases: ['welcome'],
    usage: '<message ...>',
    args: false,
    cooldown: 1,
    accessLevel: 3,
    async execute(message, args) {
        const newMessage = args ? args.join(' ') : '';

        message.client.customShit.welcomeMessage = newMessage;
        await message.client.saveConfig();

        if (newMessage) message.channel.sendResolve(`{{happy}} Set welcome message to "${args.join(' ')}"`);
        else message.channel.sendResolve(`{{happy}} Reset welcome message`);
    }
};