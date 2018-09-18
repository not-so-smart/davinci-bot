const { Users } = require('../dbObjects.js');
const { CommunityRoles, SkillRoles } = require('../data/roles.json');

function findRole(member, roleObject) {
    const x = member.roles.array();
    for (let i = 0; i < x.length; i++) {
        const role = x[i];
        if (role.id in roleObject) return role;
    }
    return false;
}

module.exports = {
    name: 'profile',
    displayName: 'Profile',
    description: 'Shows your profile, or that of another user.',
    aliases: [],
    usage: '<> [user]',
    args: false,
    cooldown: 10,
    async execute(message, args) {
        const targetMember = message.mentions.members.size ? message.mentions.members.first() : message.member;

        // Fetch profile information
        const target = await Users.findOrCreate({ where: { id: targetMember.id } })
            .spread((user, created) => {
                if (created) console.log('Created user ' + targetMember.user.tag + ' with id ' + message.author.id);
                return user;
            })
            .catch(error => console.error('Error finding or creating user:\n' + error));
        
        const communityRole = findRole(targetMember, CommunityRoles);
        const skillRole = findRole(targetMember, SkillRoles);
        
        // Display profile information
        let data = '';
        data += `~{**${targetMember.displayName}**}~\n`;
        if (communityRole) data += `**${communityRole.name}** `;
        if (skillRole) data += `**${skillRole.name}**`;
        data += '\n';
        data += `Hearts: **${target.heartCount}**{{epiheart}}\n`;
        data += `Member Since: **${targetMember.joinedAt.toUTCString().slice(0, -12)}**`;
        message.channel.sendResolve(data);
    }
};