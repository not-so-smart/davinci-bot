const { prefix, adminPrefix } = require('../config.json');
const { StaffRoles } = require('../roles.json');

function getAccessLevel(mem) {
    const x = mem.roles.array();
    for (let i = 0; i < x.length; i++) {
        const role = x[i];
        if (role.id in StaffRoles) return StaffRoles[role.id];
    }
    return 0;
}

module.exports = {
    name: 'help',
    displayName: 'Help',
    description: 'Displays the help menu, or provides info on a particular command.',
    aliases: [],
    usage: '<> [command]',
    args: false,
    cooldown: 3,
    execute(message, args) {
        const { commands } = message.client;
        let admin = 0;
        if (message.content.startsWith(message.client.customShit.adminPrefix)) admin = getAccessLevel(message.member);
        var data = '';

        if (!args.length) {
            // data += '\' DaVinci Command List: \'\n\n'
            commands.forEach((command, index) => {
                if (admin - command.accessLevel < 0) return;
                data += `# ${admin ? adminPrefix : prefix}${command.displayName || command.name} ${command.usage || '<>'}\n`;
                data += command.description ? ` // ${command.description}\n` : '\n';
            });
            data += `\nRequired arguments are shown in <pointy>. Optional arguments are shown in [square].\n`;
            data += `You can get more info on a particular command by using: \'${prefix}Help <command>\'`;

            return message.channel.send(data, { code: 'c' });
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('that\'s not a valid command!');
        }

        data += `<Command Reference>\n\n`;

        if (command.name) data += `[command](${command.displayName || command.name})\n`
        if (command.description) data += `[description](${command.description})\n`;
        if (command.aliases && command.aliases.length) data += `[aliases](${command.aliases.join(', ')})\n`;
        if (command.usage) data += `[usage](${prefix}${command.name} ${command.usage})\n`;
        if (command.cooldown) data += `[cooldown](${command.cooldown} sec)`;

        message.channel.send(data, { code: 'md' });
    }
};