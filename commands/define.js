const { definitions } = require('../data/definitions.json');

module.exports = {
    name: 'define',
    displayName: 'Define',
    description: 'Shows the definition for a pre-defined word or phrase.',
    aliases: ['definition', 'def', 'tag'],
    usage: '<word> | "list"',
    args: false,
    cooldown: 1,
    accessLevel: 0,
    async execute(message, args) {
        if (!args.length) return message.channel.send('Here\'s a list of stuff to define:\n\n`'+definitions.map(a => a.name).join('`, `')+'`')
        let query = args[0].toLowerCase();
        if (query == 'list') return message.channel.send('`'+definitions.map(a => a.name).join('`, `')+'`');
        let def;
        for (const item of definitions) {
            if ((item.name && item.name == query) ||
                (item.aliases && item.aliases.includes(query))) {
                def = item;
                break;
            }
        }
        if (def) {
            return message.channel.send(def.definition || "No definition.");
        }
        else {
            return message.channel.sendResolve(`{{think}} I couldn't find a definition with that name!\n\nTry \`dv!define list\` for a list of definitions.`);
        }
    }
};