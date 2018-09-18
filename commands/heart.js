const { Users } = require('../dbObjects.js');
const { CommunityRoles } = require('../data/roles.json');

function findRole(member, roleObject) {
    const x = member.roles.array();
    let role = false;
    for (let i = 0; i < x.length; i++) {
        const item = x[i];
        if (item.id in roleObject) role = item.id;
    }
    return role;
}

function findNewRole(value, obj) {
    let role;
    if (value < obj[Object.keys(obj)[0]]) role = false;
    else role = Object.keys(obj).reduce((a, b) => obj[b] > obj[a] && obj[b] <= value ? b : a);
    return role;
}

module.exports = {
    name: 'heart',
    displayName: 'Heart',
    description: 'View your Epiheart stats.',
    aliases: ['giveheart', 'hearts'],
    usage: '<>',
    args: false,
    async execute(message, args) {
        // Fetch the author's info
        const initiatorMember = message.member;
        const initiator = await Users.findOrCreate({ where: { id: initiatorMember.id } })
            .spread((user, created) => {
                if (created) console.log('Created user ' + initiatorMember.user.tag + ' with id ' + message.author.id);
                return user;
            })
            .catch(error => console.error('Error finding or creating user:\n' + error));

        // Look at the clock and check what time it is
        const now = Date.now();
        let s = 86400000 - now % 86400000;
        let ms = s % 1000;
        s = (s - ms) / 1000;
        let secs = s % 60;
        s = (s - secs) / 60;
        let mins = s % 60;
        let hours = (s - mins) / 60;
        const timeTillReset = (hours ? hours + ' hour(s), ' : '') + ((hours || mins) ? mins + ' min(s), ' : '') + secs + ' sec(s)';
        const hasGivenHeart = initiator.lastHeartTimestamp >= now - now % 86400000;

        if (message.mentions.members.size) {

            return message.channel.sendResolve('{{epiheartbreak}} This command has been disabled. To give a user a heart now, react to their message with {{epiheart}}!')
            
            // Remove this line ^ and uncomment below section to enable heart granting through dv!heart
            
            /*
            // If any users are mentioned, target the first user
            const targetMember = message.mentions.members.first();
            const target = await Users.findOrCreate({ where: { id: targetMember.id } })
                .spread((user, created) => {
                    if (created) console.log('Created user ' + targetMember.user.tag + ' with id ' + message.author.id);
                    return user;
                })
                .catch(error => console.error('Error finding or creating user:\n' + error));

            // Fetch the user's current community role
            const currentRole = findRole(targetMember, CommunityRoles);

            // Only one per day u.u
            if (hasGivenHeart) {
                return message.channel.sendResolve(`{{epiheartbreak}} **${initiatorMember.displayName}**, you already gave away your heart today!\n\nHearts reset in: **${timeTillReset}**`);
            }

            // No giving heart to yourself >:(
            if (targetMember.id == initiatorMember.id) {
                return message.channel.sendResolve(`{{epiheartbreak}} You can't give yourself a heart.`);
            }

            // Hearts blacklist </3
            if (['274831493648613377', '297842682007650305'].includes(targetMember.id)) {
                return message.channel.sendResolve(`{{epiheartbreak}} Sorry, but **${targetMember.displayName}** doesn't deserve your heart.`);
            }

            try {
                // The real deal <3
                target.heartCount += 1;
                initiator.heartsGiven += 1;
                initiator.lastHeartGiven = targetMember.displayName;
                initiator.lastHeartID = targetMember.id;
                initiator.lastHeartTimestamp = now;
                await initiator.save();
                await target.save();

                message.channel.sendResolve(`{{epiheart}} **${initiatorMember.displayName}** has given **${targetMember.displayName}** their heart today!`);

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
            */

        } else {
            // If no users are mentioned, display the author's stats
            var data = '';
            if (initiator.heartCount) data += `**${initiatorMember.displayName}** has collected a total of  **${initiator.heartCount}**{{epiheart}}\n\n`;
            if (hasGivenHeart) data += `You have given today's {{epiheart}} to ${initiator.lastHeartGiven != null ? '**' + initiator.lastHeartGiven + '**' : 'someone'}.\n`;
            else data += 'You have  **1**{{epiheart}} available to give to another member. Use it wisely!\n';
            data += `You can give another heart in: **${timeTillReset}**`;

            return message.channel.sendResolve(data);
        }


    }
};