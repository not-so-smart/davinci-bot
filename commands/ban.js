module.exports = {
    name: 'ban',
    displayName: 'Ban',
    description: 'Bans a user.',
    aliases: [],
    usage: '<user>',
    args: true,
    cooldown: 1,
    accessLevel: 2,
    async execute(message, args) {
        if (!(/<@!?([0-9]+)>/g.test(args.shift())) || !message.mentions.members.size) return message.channel.sendResolve(`{{sad}} Sorry... I couldn't find that user, make sure you @mention them properly!`);
        const targetMember = message.mentions.members.first();

        if (!args.length) {
            return message.channel.sendResolve(`{{sad}} Oopsie... This is probably a little awkward now, but, you need to provide a reason for banning ${targetMember.displayName}.\n\n\`${message.client.customShit.adminPrefix}ban @${targetMember.displayName} <reason ...>\``);
        }
        const reason = args.join(' ');

        await targetMember.send(`Hello **${targetMember.displayName}**.\n\nYou've been banned from **${message.guild.name}** for the reason: *${reason}*. If you feel this reason was unclear, it was likely due to behaviour that we deemed as inappropriate for the community. If you feel like you didn't deserve to be banned or you've been misunderstood, add Jimi#9999 as a friend and discuss it with him personally.\n\nPlease understand that Epichroma uses a ban and appeal system over a multiple warning system. We've found this has helped to reduce melodrama.\n\nWe wish you all the best with your art career.\n\nYours,\nEpichroma Staff`)
            .catch(e => { /* meh */ });
        targetMember.ban({ reason: `Mod: ${message.author.tag} -- Reason: ${reason}` })
            .then(() => {
                message.channel.sendResolve(`{{joyful}} Banned ${targetMember.user.username} :runner:`);
            }).then(() => {
                message.client.channels.get(message.client.customShit.reportChannel).sendResolve(`User \`${targetMember.user.tag}\` was banned :runner: by **${message.member.displayName}**\n\n**Reason:** ${reason}`);
            });
    }
};