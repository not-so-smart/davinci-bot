const { prompts, prefixes } = require('../data/prompts.json');
module.exports = {
    name: 'prompt',
    displayName: 'Prompt',
    description: 'Generates a random drawing prompt.',
    aliases: ['whattodraw', 'idea', 'artprompt'],
    usage: '<>',
    args: false,
    cooldown: 300,
    execute(message, args) {
        const index1 = Math.ceil(Math.random() * prompts.length - 1);
        const prompt = prompts[index1];

        const index2 = Math.ceil(Math.random() * prefixes.length - 1);
        const prefix = prefixes[index2].replace('USER', message.member.displayName);

        return message.channel.sendResolve(`${prefix}\n\n\`\`\`asciidoc\n= ${prompt} =\n\`\`\``)
    }
};