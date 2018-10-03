const Discord = require('discord.js');
const fs = require('fs');

const client = new Discord.Client();
const config = require('./data/config.json');
const { StaffRoles } = require('./data/roles.json');
const cooldowns = new Discord.Collection();
client.commands = new Discord.Collection();
passiveFunctions = new Object();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const passiveFiles = fs.readdirSync('./passive').filter(file => file.endsWith('.js'));
let oof = true;
const DM = {
    day: getDayUTC(),
    cooldowns: {}
}

function getTimeUTC() {
    var today = new Date();
    var hh = today.getUTCHours();
    var mm = today.getUTCMinutes();
    //var m;
    //if (hh > 12) {
    //    hh -= 12;
    //    m = 'p';
    //} else m = 'a';
    if (hh < 10) hh = '0' + hh;
    if (mm < 10) mm = '0' + mm;
    return hh + ':' + mm //+ m;
}

function getDayUTC() {
    var today = new Date();
    var dd = today.getUTCDate();
    var mm = today.getUTCMonth() + 1; //January is 0!
    var yyyy = today.getUTCFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    return dd + '-' + mm + '-' + yyyy;
}

console.log(DM.day + ' - ' + getTimeUTC());

module.exports = { client };

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

for (const file of passiveFiles) {
    const func = require(`./passive/${file}`);
    passiveFunctions[func.name] = func.execute;
}

client.customShit = config;
client.login(client.customShit.token);

Discord.TextChannel.prototype.sendResolve = function (message) {
    // Find all emoji names within brackets and replace them with <:name:000000000>
    messageResolved = message.replace(/{{([a-zA-Z0-9]{0,32})}}/g, (_x, emoji) => {
        let result = client.emojis.find('name', emoji);
        return result ? result.toString() : emoji;
    });
    return this.send(messageResolved);
}

function getAccessLevel(mem) {
    const x = mem.roles.array();
    for (let i = 0; i < x.length; i++) {
        const role = x[i];
        if (role.id in StaffRoles) return StaffRoles[role.id];
    }
    return 0;
}

client.saveConfig = function () {
    const data = this.customShit;
    if (data && typeof data == 'object') {
        fs.writeFile('./data/config.json', JSON.stringify(data, null, '\t'), (err) => {
            if (err) console.error(err);
            else console.log('Saved config settings.');
        });
    } else console.log('Config is not an object! Not writing to file...');
}
client.saveConfig();

client.once('ready', () => {
    console.log('Logged in as ' + client.user.tag);
});

// Member join handler
client.on('guildMemberAdd', (member) => {
    // Welcome message
    if (client.customShit.welcomeMessage && client.customShit.welcomeChannel) {
        const data = client.customShit.welcomeMessage.replace('[[USER]]', member);
        client.channels.get(client.customShit.welcomeChannel).sendResolve(data);
    }
    // Auto roles
    if (Object.values(client.customShit.autoRoles).length) {
        for (i in client.customShit.autoRoles) {
            member.addRole(i);
        }
    }
});

// Reaction handler
client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.emoji.name != 'epiheart') return;
    const initiator = reaction.message.guild.member(user.id);
    const target = reaction.message.member;
    const message = reaction.message;
    passiveFunctions.heartPassive(initiator, target, message);
});

// Message handler
client.on('message', async message => {
    if (message.author.id == client.user.id) return;
    // DM handler
    if (message.channel.type == 'dm' || message.channel.type == 'group') {
        if (DM.day != getDayUTC()) {
            for (const i in DM.cooldowns) {
                if (DM.cooldowns.hasOwnProperty(i)) {
                    DM.cooldowns[i] = 0;
                }
            }
            DM.day = getDayUTC();
            console.log(DM);
        }
        let send;
        if (message.author.id in DM.cooldowns) {
            if (DM.cooldowns[message.author.id] >= 5) send = false;
            else {
                DM.cooldowns[message.author.id] += 1;
                send = true;
            }
        } else {
            send = true;
            DM.cooldowns[message.author.id] = 1;
        }
        if (send) {
            client.channels.get('483795693048168448').send(`<@&454386394832568321> [${getTimeUTC()}] **${message.author.username}**: ${message.content}`)
                .then(message.channel.send('Thank you, your message has been delivered to Epichroma staff.'));
        } else {
            message.channel.send(':no_entry: Sorry friend, you can only use this feature 5 times per day.');
        }
    }
    if (message.channel.type != 'text') return; // Ignore DMs & groups

    // Oof handler  o.o
    if (['oof', 'ooof', 'oof.'].includes(message.content.toLowerCase())) {
        message.delete();
        if (oof) {
            message.channel.sendResolve('{{epiheartbreak}} Do not oof.');
            oof = false;
            setTimeout(() => {
                oof = true;
            }, 300000);
        }
    }

    // Per-message filtering/detection
    if (getAccessLevel(message.member) < 1 && !message.author.bot) {
        let filtered = false;
        client.customShit.chatFilter.forEach(word => {
            if (message.content.toLowerCase().includes(word)) filtered = true;
        });
        if (filtered) message.channel.send('<@&454386394832568321> [Profanity Detection]');
    }

    // Start command handler
    if (!(message.content.startsWith(client.customShit.prefix) || message.content.startsWith(client.customShit.adminPrefix))) return;

    const args = message.content.slice(client.customShit.prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    // Ghetto permissions check
    //                         // This is bitwise XOR, fuck you                            // Because help is for everyone <33
    if ((command.accessLevel > 0) ^ message.content.startsWith(client.customShit.adminPrefix) && command.name != 'help') return console.log('Wrong Prefix. (' + command.name + ', ' + message.author.tag + ')');

    if ((command.accessLevel || 0) > getAccessLevel(message.member)) return console.log('Access Denied. (' + command.name + ', ' + message.author.tag + ')');

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (!timestamps.has(message.author.id)) {
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }
    else {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.channel.sendResolve(`⛔ Sorry ${message.member.displayName}, that command is on cooldown! Please wait ${timeLeft.toFixed(1)} second(s) before trying again.`);
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.member.displayName}!`;

        if (command.usage) {
            reply += `\n\nThe proper usage is: \`${client.customShit.prefix}${command.displayName} ${command.usage}\``;
        }

        return message.channel.sendResolve(reply);
    }

    try {
        command.execute(message, args);
    }
    catch (error) {
        console.error(error);
        message.channel.sendResolve('An error happened {{sad}} please bother sym for details \n\n`' + error.message + '`');
    }
});

client.on('error', (error) => {
    console.log('--- Error --- ' + error.message);
});

process.on('unhandledRejection', (error) => {
    console.log('--- Unhandled Rejection --- ' + error.message + '\n' + error.stack);
});