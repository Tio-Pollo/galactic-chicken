const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {
 
    if (message.content == 'ping') {
        //message.reply('pong');  message.channel.send()
        message.channel.send('pong');
    } else if (message.content == 'say hi') {
        message.channel.send('Hi!');
    } else if (/^off with his head/i.test(message.content)) {
        message.channel.send('!mum <@595444300116918272>');
    } else if (/^\W*coffee$/i.test(message.content)) {
        message.channel.send('☕');
    }
});


 

client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
