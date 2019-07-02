const Discord = require('discord.js');
const client = new Discord.Client();



if (client) {
          const channel = client.channels.find('name', 'chicken-test');
          if (channel) {
              channel.send('Event starts now??');
          }
}
