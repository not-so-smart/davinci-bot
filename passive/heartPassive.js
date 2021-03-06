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
    name: 'heartPassive',
    async execute(initiatorMember, targetMember, message, reaction) {

        /***************
        *     INIT     *
        ***************/

        // Fetch everyone's info from the database
        const initiator = await Users.findOrCreate({ where: { id: initiatorMember.id } })
            .spread((user, created) => {
                if (created) console.log('Created user ' + initiatorMember.user.tag + ' with id ' + initiatorMember.id);
                return user;
            })
            .catch(error => console.error('Error finding or creating user:\n' + error));

        const target = await Users.findOrCreate({ where: { id: targetMember.id } })
            .spread((user, created) => {
                if (created) console.log('Created user ' + targetMember.user.tag + ' with id ' + targetMember.id);
                return user;
            })
            .catch(error => console.error('Error finding or creating user:\n' + error));

        // Fetch the target's current community role
        const currentRole = findRole(targetMember, CommunityRoles);

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


        /***************
        *    CHECKS    *
        ***************/

        // No giving heart to yourself >:(
        if (targetMember.id == initiatorMember.id) {
            reaction.remove(initiatorMember);
            return message.channel.sendResolve(`{{epiheartbreak}} You can't give yourself a heart.`)
                .then(msg => msg.delete(2000)); // 2 secs
        }

        // Hearts blacklist </3
        const blacklist = ['274831493648613377', '181008350471782408', '297842682007650305'];
        if (blacklist.includes(targetMember.id)) {
            reaction.remove(initiatorMember);
            return message.channel.sendResolve(`{{epiheartbreak}} Sorry, but **${targetMember.displayName}** doesn't deserve your heart.`)
                .then(msg => msg.delete(10000)); // 10 secs
        } else if (targetMember.id == '462053530321289216') {
            reaction.remove(initiatorMember);
            return message.channel.sendResolve(`{{epiheartbreak}} I love you too, but it simply wasn't meant to be. I'm sorry.`)
                .then(msg => msg.delete(10000)); // 10 secs
        }

        // Only one per day u.u
        if (hasGivenHeart) {
            reaction.remove(initiatorMember);
            return message.channel.sendResolve(`{{epiheartbreak}} **${initiatorMember.displayName}**, you already gave away your heart today!\n\nHearts reset in: **${timeTillReset}**`)
                .then(msg => msg.delete(10000)); // 10 secs
        }

        // Filter out image-only posts!
        if (!message.content) {
            reaction.remove(initiatorMember);
            return message.channel.sendResolve(`{{epiheartbreak}} Use your hearts for people who give helpful feedback, not just for art you like!`)
                .then(msg => msg.delete(10000)); // 10 secs
        }

        // Please don't spam and trade T.T
        if (targetMember.id == initiator.lastHeart0 && targetMember.id == initiator.lastHeart1) {
            reaction.remove(initiatorMember);
            return message.channel.sendResolve(`{{epiheartbreak}} You've given **${targetMember.displayName}** your heart twice in a row, how about finding somebody else this time?`)
                .then(msg => msg.delete(10000)); // 10 secs
        }


        /**************
        *     RUN     *
        **************/

        try {
            target.heartCount += 1;
            initiator.heartsGiven += 1;
            initiator.lastHeartName = targetMember.displayName;
            initiator.lastHeart1 = initiator.lastHeart0;
            initiator.lastHeart0 = targetMember.id;
            initiator.lastHeartTimestamp = now;
            await initiator.save();
            await target.save();

            message.channel.sendResolve(`{{epiheart}} **${initiatorMember.displayName}** has given **${targetMember.displayName}** their heart today!`)
                .then(msg => msg.delete(3600000)); // 1 hour

            // Role handling B)
            const newRole = findNewRole(target.heartCount, CommunityRoles);

            roleHandle: {
                if (currentRole == newRole) break roleHandle;
                if (currentRole) await targetMember.removeRole(currentRole);
                if (newRole) await targetMember.addRole(newRole);
            }

        } catch (error) {
            message.channel.sendResolve('Error while granting {{epiheart}} {{sad}} Please bother sym for more info {{sad}}')
                .then(msg => msg.delete(5000));
            console.error(error);
        }

    }
}