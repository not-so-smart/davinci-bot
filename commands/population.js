module.exports = {
    name: 'population',
    displayName: 'Population',
    description: 'Shows the current Epichroma population count.',
    aliases: ['pop', 'members', 'membercount'],
    usage: '<>',
    args: false,
    cooldown: 3,
    accessLevel: 0,
    async execute(message, args) {
        return message.channel.sendResolve(`:family: **Population:** ${message.guild.memberCount}`)
    }
};