const { Users } = require('../dbObjects.js');
const { CommunityRoles } = require('../data/roles.json');

function findRole(member, roleObject) {
    const x = member.roles.array();
    let role = false;
    for (let i = 0; i < x.length; i++) {
        const item = x[i];
        if (roleObject.map(a => a.id).includes(item.id)) role = item.id;
    }
    return role;
}

function findNewRole(value, obj) {
    let role = false;
    for (const x of obj) {
        if (x.value <= value) role = x.id
    }
    return role;
}

module.exports = {
    name: 'edithearts',
    displayName: 'EditHearts',
    description: 'Grants/Removes x hearts from a user.',
    aliases: ['addheart', 'addhearts'],
    usage: '<hearts> <user>',
    args: true,
    cooldown: 1,
    accessLevel: 3,
    async execute(message, args) {
        let targetMember, target, currentRole;
        if (message.mentions.members.size) {
            // If any users are mentioned, target the first user
            targetMember = message.mentions.members.first();
            target = await Users.findOrCreate({ where: { id: targetMember.id } })
                .spread((user, created) => {
                    if (created) console.log('Created user ' + targetMember.user.tag + ' with id ' + message.author.id);
                    return user;
                })
                .catch(error => console.error('Error finding or creating user:\n' + error));

            // Fetch the user's current community role
            currentRole = findRole(targetMember, CommunityRoles);

        } else {
            // No members were mentioned
            return message.channel.sendResolve(`{{sad}} Sorry, but you need to mention a user.\n\n\`${message.client.customShit.adminPrefix}addhearts <user> <hearts>\``);
        }

        let amount;
        for (let i = 0; i < args.length; i++) {
            const item = args[i];
            if (!isNaN(item)) {
                amount = Number.parseInt(item);
                break;
            }
        }   // No number was found in args
        if (!amount) return message.channel.sendResolve(`{{sad}} Sorry, but you need to specify how many hearts to add.\n\n\`${message.client.customShit.adminPrefix}addhearts <user> <hearts>\``);

        try {
            // The real deal <3
            target.heartCount += amount;
            await target.save();
            message.channel.sendResolve(`{{happy}} Granted **${amount}** {{epiheart}} to **${targetMember.displayName}**!`);

            // Epic role handling B)
            const newRole = findNewRole(target.heartCount, CommunityRoles);

            roleHandle: {
                if (currentRole == newRole) break roleHandle;
                if (currentRole) await targetMember.removeRole(currentRole);
                if (newRole) await targetMember.addRole(newRole);
            }

        } catch (error) {
            message.channel.sendResolve('Error while granting {{epiheart}} {{sad}} Please bother sym for more info {{sad}}');
            console.error(error);
        }

    }
};