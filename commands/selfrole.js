module.exports = {
    name: 'selfrole',
    displayName: 'SelfRole',
    description: 'Gets a self-assignable role.',
    aliases: ['getrole'],
    usage: '<role>',
    args: false,
    cooldown: 1,
    accessLevel: 0,
    async execute(message, args) {
        const selfRoles = message.client.customShit.selfRoles;
        if (!args.length) return message.channel.sendResolve(`Here is a list of self-assignable roles you can get:\n\n${Object.values(selfRoles).length ? '`' + Object.values(selfRoles).join(', ') + '`' : 'None'}`)
        const query = args.join(' ');

        let role;
        for (const [key, val] of Object.entries(selfRoles)) {
            if (key.includes(query) || val.toLowerCase().includes(query.toLowerCase())) {
                role = key;
                break;
            }
        }

        if (role) {
            if (!message.member.roles.has(role)) {
                // add the role
                message.member.addRole(role).then(() => {
                    return message.channel.sendResolve(`{{happy}} There you go! Added role \`${selfRoles[role]}\` to **${message.member.displayName}**.`);
                });
            } else {
                // remove the role
                message.member.removeRole(role).then(() => {
                    return message.channel.sendResolve(`{{happy}} Okay! Removed role \`${selfRoles[role]}\` from **${message.member.displayName}**.`);
                });
            }
        } else {
            // role not found
            return message.channel.sendResolve(`{{sad}} Sorry, I couldn't find that role! Make sure to type the correct name of the role without @.\nSelf-assignable roles:\n\n${Object.values(selfRoles).length ? '`' + Object.values(selfRoles).join(', ') + '`' : 'None'}`);
        }
    }
};