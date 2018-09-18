module.exports = {
    name: 'unmute',
    displayName: 'Unmute',
    description: 'Unmutes a user.',
    aliases: ['unsilent', 'unsilence'],
    usage: '<user> <reason>',
    args: true,
    cooldown: 1,
    accessLevel: 1,
    async execute(message, args) {
        if (!(/<@!?([0-9]+)>/g.test(args.shift())) || !message.mentions.members.size) return message.channel.sendResolve(`{{sad}} Sorry... I couldn't find that user, make sure you @mention them properly!`);
        const targetMember = message.mentions.members.first();

        if (!targetMember.roles.has('429599328877936640')) {
            return message.channel.sendResolve(`{{think}} That user isn't muted!`);
        }

        if (!args.length) {
            return message.channel.sendResolve(`{{sad}} Sorry ${message.member.displayName}, but you need to provide a reason for unmuting ${targetMember.displayName}.\n\n\`${message.client.customShit.adminPrefix}unmute @${targetMember.displayName} <reason ...>\``);
        }
        const reason = args.join(' ');

        targetMember.removeRole('429599328877936640', `Mod: ${message.author.tag} -- Reason: ${reason}`).then(() => {
            message.channel.sendResolve(`{{joyful}} Unmuted ${targetMember.user.username} :open_mouth:`);
            message.client.channels.get(message.client.customShit.reportChannel).sendResolve(`User \`${targetMember.user.tag}\` was unmuted :sound: by **${message.member.displayName}**\n\n**Reason:** ${reason}`);
        });
    }
};