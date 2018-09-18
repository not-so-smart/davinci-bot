module.exports = {
    name: 'chatfilter',
    displayName: 'ChatFilter',
    description: 'Add/Remove one or more words from the chat filter, or list the current filter',
    aliases: ['filter', 'filters', 'profanity', 'profanities', 'seeprofanity', 'seeprofanities'],
    usage: '<words ...>',
    args: false,
    cooldown: 1,
    accessLevel: 3,
    async execute(message, args) {
        let filter = message.client.customShit.chatFilter;
        if (!args.length) return message.channel.sendResolve(`Here's a list of currently programmed profanities:\n\n${filter.length ? '`'+filter.join(', ')+'`' : 'None'}`);
        
        for (let i = 0; i < args.length; i++) {
            let item = args[i].toLowerCase();
            if (filter.indexOf(item) > -1) {
                filter.splice(filter.indexOf(item), 1);
            } else filter.push(item);
        }

        await message.client.saveConfig();
        return message.channel.sendResolve(`{{happy}} Done! New filter:\n\n${filter.length ? '`'+filter.join(', ')+'`' : 'None'}`);
    }
};