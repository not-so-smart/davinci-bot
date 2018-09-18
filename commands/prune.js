module.exports = {
    name: 'prune',
    displayName: 'Prune',
    description: 'Deletes a bunch of messages at once.',
    aliases: ['purge'],
    usage: '<number> [user]',
    args: true,
    cooldown: 1,
    accessLevel: 1,
    async execute(message, args) {
        let target, num;
        if (message.mentions.members.size) target = message.mentions.members.first();
        if (parseInt(args[0]) <= 100) num = parseInt(args[0]);
        else if (parseInt(args[1]) <= 100) num = parseInt(args[1]);
        else return message.channel.sendResolve('{{think}} You did it wrong, you need to specify a number (0 - 100)');

        let fetches = 0;
        let messages = [];
        let lastMessage = message.id;
        while (fetches < 10 && messages.length < num) {
            await message.channel.fetchMessages({ limit: 100, before: lastMessage })
                .then(msgChunk => {
                    if (target) msgChunk = msgChunk.filter(msg => msg.author.id == target.id)
                    if (msgChunk.size == 0) return;
                    lastMessage = msgChunk.last().id;
                    msgChunk.forEach(item => {
                        if (messages.length < num) messages.push(item);
                    });
                });
            fetches += 1;
        }

        if (!messages.length)
            return message.channel.sendResolve(`{{sad}} Sorry, I couldn't find any recent messages from ${target.displayName}.`);
        console.log(`Got ${messages.length} messages.\n${messages}`);
        await message.channel.bulkDelete(messages)
            .then(message.channel.sendResolve(`{{happy}} Deleted ${messages.length} messages`));
        console.log('Deleted everything');
    }
};