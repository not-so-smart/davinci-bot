const { Users } = require('../dbObjects.js');
const { Collection } = require('discord.js');
module.exports = {
    name: 'leaderboard',
    displayName: 'Leaderboard',
    description: 'Displays the hearts leaderboard.',
    aliases: ['leaderboards', 'lb', 'lbs'],
    usage: '<>',
    args: false,
    cooldown: 5,
    accessLevel: 0,
    async execute(message, args) {
        const hearts = new Collection()
        const storedValues = await Users.findAll();
        storedValues.forEach(b => hearts.set(b.id, b));
        const list = hearts.sort((a, b) => b.heartCount - a.heartCount)
            .filter(user => message.guild.members.has(user.id))

        let data = '';
        data += '```md\n'
        data += '<Community Leaderboard>\n\n';
        data += list.first(20)
            .map((user, position) => `${position + 1}.${' '.repeat(3 - (position + 1).toString().length)}[ ${message.guild.members.get(user.id).displayName} ${' '.repeat(32 - message.guild.members.get(user.id).displayName.length)} ](${user.heartCount}❤)`)
            .join('\n')
        data += '\n\n';
        if (list.has(message.author.id)) data += `${message.member.displayName}, you are #${1 + list.array().findIndex(item => item.id == message.author.id)} with ${list.get(message.author.id).heartCount}❤.\n`;
        if (list.has(message.author.id)) data += '============================';
        data += '```';
        return message.channel.send(data);
    }
};