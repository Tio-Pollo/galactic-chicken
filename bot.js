const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {

    let m;

    if ((m = /^!ratio(?: +(\S.*))?/i.exec(message.content)) !== null) {
        const ratioURL = process.env.JEROENR_RATIO;
        message.channel.send(ratioURL + '?q=' + encodeURIComponent(m[1] ? m[1] : message.author.tag.split('#')[0]));
        //message.reply('pong');  message.channel.send()
    } else if (message.content == 'ping') {
        message.channel.send('pong');
    } else if (message.content == 'nicktest') {
        //let nick = ('' + message.member).split('#')[0].replace(/\W+/g,'');
        let nick = 'nope';
        try {
            nick = message.guild.member(message.author).nickname;
        } catch (e) {
        }
        message.channel.send('Hello ... ' + nick);
    } else if ((m = /^!sendmsg +(\S+) (.+)/i.exec(message.content)) !== null) {
        const channel = client.channels.find('name', m[1]);
        if (channel) {
            channel.send(m[2]);
        }
    } else if (message.content == 'say hi') {
        message.channel.send('Hi!');
    } else if (/\bchicken\b/i.test(message.content)) {
        message.react('🐔');
    } else if (/^off with his head/i.test(message.content)) {
        message.channel.send("I'm hidding behind Fireball!");
    } else if (/^\W*coffee$/i.test(message.content)) {
        message.channel.send('☕');
    }
});


 

client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
