const Canvas = require('canvas');
const Discord = require('discord.js');
const snekfetch = require('snekfetch');
const path = require('path');
const { Users } = require('../dbObjects.js');
const { CommunityRoles } = require('../data/roles.json');

function findRole(member, roleObject) {
    const x = member.roles.array();
    for (let i = 0; i < x.length; i++) {
        const role = x[i];
        if (role.id in roleObject) return role.id;
    }
    return false;
}

function formatDate(date) {
    var dd = date.getUTCDate();
    var mm = date.getUTCMonth() + 1; //January is 0!
    var yyyy = date.getUTCFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    return dd + '-' + mm + '-' + yyyy;
}

function applyText(canvas, font, text, width) {
    const ctx = canvas.getContext('2d');

    // Declare a base size of the font
    let fontSize = font.substr(0, font.indexOf('px'));
    let fontFamily = font.substr(font.indexOf('px'));

    do {
        // Assign the font to the context and decrement it so it can be measured again
        ctx.font = `${fontSize -= 1}${fontFamily}`;
        // Compare pixel width of the text to the canvas minus the approximate avatar size
    } while (ctx.measureText(text).width > width);

    // Return the result to use in the actual canvas
    return ctx.font;
};

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

        const crId = findRole(targetMember, CommunityRoles);
        const communityRole = CommunityRoles[crId];

        const skinName = target.skin;
        const skinPath = path.resolve(process.mainModule.filename, '../templates/', skinName);
        let skin;
        try {
            skin = require(`${skinPath}/config.json`)
        } catch (e) {
            console.log('Error loading skin: ' + e.message);
            return message.channel.send(':anger: Error loading skin!');
        }

        for (const i in skin.meta.fonts) {
            if (skin.meta.fonts.hasOwnProperty(i)) {
                const font = skin.meta.fonts[i];
                Canvas.registerFont(`${skinPath}/fonts/${font}`, { family: i })
            }
        }

        const canvas = Canvas.createCanvas(skin.meta.size[0], skin.meta.size[1]);
        const ctx = canvas.getContext('2d');

        const background = await Canvas.loadImage(`${skinPath}/background.png`);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        const { body: buffer } = await snekfetch.get(targetMember.user.displayAvatarURL);
        const avatar = await Canvas.loadImage(buffer);
        ctx.drawImage(avatar, skin.av.pos[0], skin.av.pos[1], skin.av.pos[2], skin.av.pos[3]);

        ctx.font = applyText(canvas, skin.name.font, targetMember.displayName, skin.name.maxWidth);
        ctx.fillStyle = skin.name.fillStyle;
        ctx.textBaseline = skin.name.fillStyle;
        ctx.textAlign = skin.name.textAlign;
        ctx.fillText(targetMember.displayName, skin.name.pos[0], skin.name.pos[1]);

        if (communityRole && skin.role) {
            const renderCR = await Canvas.loadImage(`${skinPath}/roles/${communityRole.name}.png`);
            ctx.drawImage(renderCR, skin.role.pos[0], skin.role.pos[1], skin.role.pos[2], skin.role.pos[3]);
        }

        if (target.heartCount && skin.hc) {
            ctx.font = skin.hc.font;
            ctx.fillStyle = skin.hc.fillStyle;
            ctx.textBaseline = skin.hc.textBaseline;
            ctx.textAlign = skin.hc.textAlign;
            ctx.fillText(target.heartCount, skin.hc.pos[0], skin.hc.pos[1]);
        }

        if (target.heartsGiven && skin.hg) {
            ctx.font = skin.hg.font;
            ctx.fillStyle = skin.hg.fillStyle;
            ctx.textBaseline = skin.hg.textBaseline;
            ctx.textAlign = skin.hg.textAlign;
            ctx.fillText(target.heartsGiven, skin.hg.pos[0], skin.hg.pos[1]);
        }

        if (targetMember.joinedAt && skin.join) {
            ctx.font = skin.join.font;
            ctx.fillStyle = skin.join.fillStyle;
            ctx.textBaseline = skin.join.textBaseline;
            ctx.textAlign = skin.join.textAlign;
            ctx.fillText(formatDate(targetMember.joinedAt), skin.join.pos[0], skin.join.pos[1]);
        }

        const attachment = new Discord.Attachment(canvas.toBuffer(), 'profile.png');
        message.channel.send(`Profile card for **${targetMember.displayName}**:`, attachment);

    }
};