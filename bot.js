const { Client, Attachment } = require('discord.js');
const client = new Client();

const re = {
    ratio: /^!ratio(?: +(\S.*))?$/i,
    eligible: /^!eligib(?:le|ility)(?: +(\S.*))?$/i,
    sendmsg: /^!sendmsg +(\S+) (.+)/i,
    chicken: /\bchicken\b/i,
    headoff: /^off with his head/i,
    coffee: /^\W*coffee\W*(?:please\W*)?$/i
};

client.on('ready', () => {
    const buildMsg = 'Cluck cluck! 🐔';
	const channel = client.channels.find('name', 'chicken-test');
	if (channel) {
		channel.send(buildMsg);
	} else {
		console.log(buildMsg);
	}
});

function jeroImg(baseUrl, query, message, prefix='') {
	if (!query) {
		query = (message.guild.member(message.author).nickname || message.author.tag.split('#')[0]);
	}
    if (prefix) {
        prefix = prefix + '_';
    }
	let imgName = encodeURIComponent(query),
	    imgUrl = baseUrl + '?q=' + imgName,
	    imgFilename = prefix + imgName + '.png';

	const attachment = new Attachment(imgUrl, imgFilename);
	message.channel.send(
		attachment
	)
	.catch();
}

client.on('message', message => {

    let m, nick, msg;
    msg = message.content;

    //message.reply('pong');  message.channel.send()
    
    if ((m = re.ratio.exec(msg)) !== null) {
        jeroImg(process.env.JEROENR_RATIO, m[1], message, 'ratio');
    } else if ((m = re.eligible.exec(msg)) !== null) {
        jeroImg(process.env.JEROENR_ELIGIBLE, m[1], message, 'eligible');
    } else if (msg.toLowerCase() == 'ping') {
        message.channel.send('pong');
    } else if (msg.toLowerCase() == 'nicktest') {
        nick = (message.guild.member(message.author).nickname || message.author.tag.split('#')[0]);
        message.channel.send('Hello ' + nick);
    } else if ((m = re.sendmsg.exec(msg)) !== null) {
        const channel = client.channels.find('name', m[1]);
        if (channel) {
            channel.send(m[2]);
        }
    } else if (msg.toLowerCase() == 'say hi') {
        message.channel.send('Hi!');
    } else if (re.headoff.test(msg)) {
        message.channel.send("I'm hidding behind Fireball!");
    } else if (re.chicken.test(msg)) {
        message.react('🐔');
    } else if (re.coffee.test(message.content)) {
        message.channel.send('☕');
    }
});

client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
