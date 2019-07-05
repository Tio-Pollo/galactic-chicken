const { Client, Attachment } = require('discord.js');
const client = new Client();

const re = {
    ratio: /^!ratio(?: +@?(\S.*))?$/i,
    eligible: /^!eligib(?:le|ility)(?: +@?(\S.*))?$/i,
    sendmsg: /^!sendmsg +(\S+) (.+)/i,
    headoff: /^\W*off with his head/i,
	thankyou: /^(?:\W*<@[0-9A-F]+>)?\W*t(?:hank[ syoua]*| *y[ aou]*)(?:lot|(?:very )?much|ton|mil+(?:ion)|bunch)?\W*(?:<@[0-9A-F]+>\W*)?$/i,
    coffee: /^(?:\W*<@[0-9A-F]+>)?(?:\W*I(?:'?[ld]+) (?:need|want|like|got ?t[ao] get) (?:a |some )?)?\W*cof+e+\W*(?:please\W*|<@[0-9A-F]+>\W*)*$/i,
    chicken: /\bchicken\b/i
};

client.on('message', message => {
	if (message.author == client.user) //own message
		return;

    let m, nick, msg;
    msg = message.cleanContent;
    
    if ((m = re.ratio.exec(msg)) !== null) {
        jeroImg(process.env.JEROENR_RATIO, m[1], message, 'ratio');
    } else if ((m = re.eligible.exec(msg)) !== null) {
        jeroImg(process.env.JEROENR_ELIGIBLE, m[1], message, 'eligible');
    } else if (msg.toLowerCase() == 'ping') {
        message.channel.send('pong');
    } else if (msg.toLowerCase() == 'nicktest') {
        nick = getNick(message);
        message.channel.send('Hello ' + nick);
    } else if ((m = re.sendmsg.exec(msg)) !== null) {
		const channel = findChan(m[1]);
		let allowed = false;
		if (message.member) {
			allowed = message.member.hasPermission('BAN_MEMBERS');
		} elseif (channel) {
			message.reply('m guild: ' + message.guild + ' -- c guild: ' + channel.guild);
		}
		if (allowed) {
			if (channel) {
				channel.send(m[2]);
			} else {
				message.channel.send(m[1] + ' ' + m[2]);
			}
		}
    } else if (msg.toLowerCase() == 'say hi') {
        message.channel.send('Hi!');
    } else if (re.headoff.test(msg)) {
        message.channel.send("I'm hidding behind Fireball!");
    } else if (re.coffee.test(message.content)) {
        message.channel.send('☕');
    } else if (message.isMemberMentioned(client.user) && re.thankyou.test(message.content)) {
		let arrAnswer = [
				'no problem!', "don't mention it :thumbsup:", "you're welcome!", 'anytime! :ok_hand:',
				"you're quite welcome, pal", ':chicken::thumbsup:', "that's alright", 'no prob', 'happy to help',
				'happy to help :robot:', "it's my pleasure", 'no worries! :ok_hand:', 'No, thank YOU',
				'it was the least I could do', 'glad to help', 'sure!', 'you got it, mate'
			],
			answer = arrAnswer[Math.floor(Math.random() * arrAnswer.length)];
        message.channel.send(answer);
    } else if (message.isMemberMentioned(client.user) || re.chicken.test(msg)) {
        message.react('🐔');
    }
});

function getNick(message) {
	let nick = '{nick}'
	try {
		nick = (message.guild.member(message.author).nickname || message.author.tag.split('#')[0]);
	} catch (e) {
		nick = message.author.tag.split('#')[0] || message.author.username || '';
	}
	return nick;
}

function findChan(str) {
	return client.channels.find(ch => ch.name.toLowerCase().startsWith(str.toLowerCase()));
}

function jeroImg(baseUrl, query, message, prefix='') {
	if (!query) query = getNick(message);
    if (prefix) prefix = prefix + '_';
	
	let imgName = encodeURIComponent(query.trim()),
		imgUrl = baseUrl + '?q=' + imgName,
		imgFilename = prefix + imgName + '.png';

	const attachment = new Attachment(imgUrl, imgFilename);
	message.channel.send(
		attachment
	)
	.catch();
}

client.on('ready', () => {
    const buildMsg = 'Cluck cluck! 🐔';
	const channel = client.channels.find(ch => ch.name === process.env.TEST_CHAN);
	if (channel) {
		channel.send(buildMsg);
	} else {
		console.log(buildMsg);
	}
	
	const now = new Date();
	client.user.setActivity('since '
		+ now.getUTCDay() + '/' + (now.getUTCMonth() + 1)
		+ ' ' + now.getUTCHours() + ':' + ('' + now.getUTCMinutes()).padStart(2, '0')
	, {type: "WATCHING"});
});

client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret from https://discordapp.com/developers/applications/me