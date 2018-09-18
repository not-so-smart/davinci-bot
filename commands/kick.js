module.exports = {
    name: 'kick',
    displayName: 'Kick',
    description: 'Kicks a user.',
    aliases: [],
    usage: '<user>',
    args: true,
    cooldown: 1,
    accessLevel: 2,
    async execute(message, args) {
        if (!(/<@!?([0-9]+)>/g.test(args.shift())) || !message.mentions.members.size) return message.channel.sendResolve(`{{sad}} Sorry... I couldn't find that user, make sure you @mention them properly!`);
        const targetMember = message.mentions.members.first();

        if (!args.length) {
            return message.channel.sendResolve(`{{sad}} Oopsie... This is probably a little awkward now, but, you need to provide a reason for kicking ${targetMember.displayName}.\n\n\`${message.client.customShit.adminPrefix}kick @${targetMember.displayName} <reason ...>\``);
        }
        const reason = args.join(' ');

        targetMember.kick(`Mod: ${message.author.tag} -- Reason: ${reason}`).then(() => {
            message.channel.sendResolve(`{{joyful}} Kicked ${targetMember.user.username} :dancer:`);
            message.client.channels.get(message.client.customShit.reportChannel).sendResolve(`User \`${targetMember.user.tag}\` was kicked :dancer: by **${message.member.displayName}**\n\n**Reason:** ${reason}`);
        });
    }
};