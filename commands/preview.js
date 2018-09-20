const Discord = require('discord.js');
const Canvas = require('canvas');
const snekfetch = require('snekfetch');
const { Users } = require('../dbObjects.js');
const { CommunityRoles, SkillRoles } = require('../data/roles.json');

function findRole(member, roleObject) {
    const x = member.roles.array();
    for (let i = 0; i < x.length; i++) {
        const role = x[i];
        if (role.id in roleObject) return role.id;
    }
    return false;
}

module.exports = {
    name: 'preview',
    displayName: 'Preview',
    description: 'Shhhhhh!',
    aliases: [],
    usage: '',
    args: false,
    cooldown: 3,
    accessLevel: 0,
    async execute(message, args) {
        const targetMember = message.mentions.members.size ? message.mentions.members.first() : message.member;

        // Fetch profile information
        const target = await Users.findOrCreate({ where: { id: targetMember.id } })
            .spread((user, created) => {
                if (created) console.log('Created user ' + targetMember.user.tag + ' with id ' + message.author.id);
                return user;
            })
            .catch(error => console.error('Error finding or creating user:\n' + error));
        
        const crId = findRole(targetMember, CommunityRoles);
        const srId = findRole(targetMember, SkillRoles);
        const communityRole = CommunityRoles[crId];
        const skillRole = SkillRoles[srId];

        const template = 'shit-template';

        const canvas = Canvas.createCanvas(500, 360);
        const ctx = canvas.getContext('2d');

        const background = await Canvas.loadImage(`../templates/${template}/background.jpg`);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        const { body: buffer } = await snekfetch.get(targetMember.user.displayAvatarURL);
        const avatar = await Canvas.loadImage(buffer);
        ctx.drawImage(avatar, 37, 35, 64, 65);

        ctx.font = '60px comic-sans';
        ctx.fillStyle = '#000000';
        ctx.fillText(targetMember.displayName, 218, 42);

        const renderSR = await Canvas.loadImage(`../templates/${template}/skill/${skillRole.name}.png`);
        ctx.drawImage(renderSR, 273, 164, 168, 43);

        const renderCR = await Canvas.loadImage(`../templates/${template}/community/${communityRole.name}.png`);
        ctx.drawImage(renderCR, 210, 256, 168, 43);

        const attachment = new Discord.Attachment(canvas.toBuffer(), 'profile.png');
        channel.send(`Profile card for **${targetMember.displayName}**:`, attachment);
        




        // Display profile information
        //let data = '';
        //data += `~{**${targetMember.displayName}**}~\n`;
        //if (communityRole) data += `**${communityRole.name}** `;
        //if (skillRole) data += `**${skillRole.name}**`;
        //data += '\n';
        //data += `Hearts: **${target.heartCount}**{{epiheart}}\n`;
        //data += `Member Since: **${targetMember.joinedAt.toUTCString().slice(0, -12)}**`;
        //message.channel.sendResolve(data);
    }
};