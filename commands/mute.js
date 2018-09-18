module.exports = {
    name: 'mute',
    displayName: 'Mute',
    description: 'Mutes a user.',
    aliases: ['silent', 'silence'],
    usage: '<user> <reason>',
    args: true,
    cooldown: 1,
    accessLevel: 1,
    async execute(message, args) {
        if (!(/<@!?([0-9]+)>/g.test(args.shift())) || !message.mentions.members.size) return message.channel.sendResolve(`{{sad}} Sorry... I couldn't find that user, make sure you @mention them properly!`);
        const targetMember = message.mentions.members.first();

        if (targetMember.roles.has('429599328877936640')) {
            return message.channel.sendResolve(`{{think}} That user is already muted!`);
        }

        if (!args.length) {
            return message.channel.sendResolve(`{{sad}} Oopsie... This is probably a little awkward now, but, you need to provide a reason for muting ${targetMember.displayName}.\n\n\`${message.client.customShit.adminPrefix}mute @${targetMember.displayName} <reason ...>\``);
        }
        const reason = args.join(' ');

        targetMember.addRole('429599328877936640', `Mod: ${message.author.tag} -- Reason: ${reason}`).then(() => {
            message.channel.sendResolve(`{{joyful}} Muted ${targetMember.user.username} :zipper_mouth:`);
            message.client.channels.get(message.client.customShit.reportChannel).sendResolve(`User \`${targetMember.user.tag}\` was muted :mute: by **${message.member.displayName}**\n\n**Reason:** ${reason}`);
        });
    }
};