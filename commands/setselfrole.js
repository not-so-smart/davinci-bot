module.exports = {
    name: 'addselfrole',
    displayName: 'AddSelfRole',
    description: 'Enables/Disables a role from being self-assignable to users',
    aliases: ['setselfrole', 'removeselfrole'],
    usage: '<@role>',
    args: false,
    cooldown: 1,
    accessLevel: 3,
    async execute(message, args) {
        let selfRoles = message.client.customShit.selfRoles;
        if (!args.length) return message.channel.sendResolve(`Here's a list of currently programmed selfroles:\n\n${Object.values(selfRoles).length ? '`'+Object.values(selfRoles).join(', ')+'`' : 'None'}`);
        
        message.mentions.roles.forEach(role => {
            if (role.id in selfRoles) {
                delete selfRoles[role.id];
            } else selfRoles[role.id] = role.name;
        });

        await message.client.saveConfig();
        return message.channel.sendResolve(`{{happy}} Done! Selfroles:\n\n${Object.values(selfRoles).length ? '`'+Object.values(selfRoles).join(', ')+'`' : 'None'}`);
    }
};