const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {

    console.log('I am ready!');
    eventStart();
});



const cron = require('cron');
function eventStart() {
    let scheduledMessage = new cron.CronJob('00 00 01 * * 2-4', () => {
        // This runs every day at 01:00:00, you can do anything you want
        const channel = client.channels.find('name', 'chicken-test');
        if (channel) {
            channel.send('Event starts now??');
        }
    });

    // When you want to start it, use:
    scheduledMessage.start()
    console.log('I will announce events!!!');
}

 

client.on('message', message => {
 
    if (message.content == 'ping') {
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
