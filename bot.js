const Discord = require('discord.js');

const client = new Discord.Client();

 

client.on('ready', () => {

    console.log('I am ready!');

});

 

client.on('message', message => {
 
    if (message.content == 'ping') {
        //message.reply('pong');  message.channel.send()
        message.reply('pong');
    } elseif (message.content == 'say hi' || message.content == '@GalacticChicken say hi') {
        message.reply('Hi!');
    }
});

 

client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
