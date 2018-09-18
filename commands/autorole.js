module.exports = {
    name: 'autorole',
    displayName: 'AutoRole',
    description: 'Toggles on/off automatic role allocation of a role for new users',
    aliases: ['autoroles'],
    usage: '<@role>',
    args: false,
    cooldown: 1,
    accessLevel: 3,
    async execute(message, args) {
        let autoRoles = message.client.customShit.autoRoles;
        if (!args.length) return message.channel.sendResolve(`Here's a list of currently programmed autoroles:\n\n${Object.values(autoRoles).length ? '`'+Object.values(autoRoles).join(', ')+'`' : 'None'}`);
        
        message.mentions.roles.forEach(role => {
            if (role.id in autoRoles) {
                delete autoRoles[role.id];
            } else autoRoles[role.id] = role.name;
        });

        await message.client.saveConfig();
        return message.channel.sendResolve(`{{happy}} Done! Autoroles:\n\n${Object.values(autoRoles).length ? '`'+Object.values(autoRoles).join(', ')+'`' : 'None'}`);
    }
};