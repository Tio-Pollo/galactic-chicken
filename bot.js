const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {

    let m;

    if ((m = /^!ratio(?: +(\S.*))?/i.exec(message.content)) !== null) {
        if (m[1]) {
            message.channel.send('https://jeroenr.nl/gf-dt/ratio.png?q=' + encodeURIComponent(m[1]));
        } else {
            message.channel.send('https://jeroenr.nl/gf-dt/ratio.png?q=' + encodeURIComponent(message.author.username));
        }
    } else if (message.content == 'ping') {
        //message.reply('pong');  message.channel.send()
        message.channel.send('pong');
    } else if (message.content == 'say hi') {
        message.channel.send('Hi!');
    } else if (/^off with his head/i.test(message.content)) {
        message.channel.send("I'm hidding behind Fireball!");
    } else if (/^\W*coffee$/i.test(message.content)) {
        message.channel.send('☕');
    }
});


 

client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
