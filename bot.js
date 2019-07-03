const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log('Cluck cluck! 🐔');
});

const re = {
    ratio: /^!ratio(?: +(\S.*))?/i,
    sendmsg: /^!sendmsg +(\S+) (.+)/i,
    chicken: /\bchicken\b/i,
    headoff: /^off with his head/i,
    coffee: /^\W*coffee\W*(?:please\W*)?$/i
};

client.on('message', message => {

    let m, nick, msg;
    msg = message.content;

    //message.reply('pong');  message.channel.send()
    
    if ((m = re.ratio.exec(msg)) !== null) {
        const ratioURL = process.env.JEROENR_RATIO;
        nick = (message.guild.member(message.author).nickname || message.author.tag.split('#')[0]);
        message.channel.send(ratioURL + '?q=' + encodeURIComponent(m[1] ? m[1] : nick));
    } else if (msg.toLowerCase() == 'ping') {
        message.channel.send('pong');
    } else if (msg.toLowerCase() == 'nicktest') {
        nick = (message.guild.member(message.author).nickname || message.author.tag.split('#')[0]);
        message.channel.send('Hello ... ' + nick);
    } else if ((m = re.sendmsg.exec(msg)) !== null) {
        const channel = client.channels.find('name', m[1]);
        if (channel) {
            channel.send(m[2]);
        }
    } else if (msg.toLowerCase() == 'say hi') {
        message.channel.send('Hi!');
    } else if (re.chicken.test(msg)) {
        message.react('🐔');
    } else if (re.headoff.test(msg)) {
        message.channel.send("I'm hidding behind Fireball!");
    } else if (re.coffee.test(message.content)) {
        message.channel.send('☕');
    }
});


 

client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
