const { Client, Attachment } = require('discord.js');
const client = new Client();

const re = {
    ratio: /^!ratio(?: +@?(\S.*))?$/i,
    eligible: /^\W*eligib(?:le|ility)(?: +@?(\S+(?:\s+\S+){0,3}))?$/i,
	daily: /^\W*(?:<@[\dA-F]+>\W*)?daily$/i,
	giphy: /^\W+(?:giphy|have)\s+(?:(?:a|the|one|some|this)\s+)*(\S.*)/i,
    sendmsg: /^! ?sendmsg +(\S+) (.+)/i,
    headoff: /^\W*off with his head/i,
	ruokhal: /\bI know everything has\W*n\W*t been quite \w*right with me\b/i,
	openthebay: /\bI know (?:that )?you and \w+\W.{0,2}re plan+ing to discon+e/i,
	thankyou: /^(?:\W*<@[\dA-F]+>)?\W*t(?:hank[ syoua]*| *y[ aou]*)(?:lot|(?:very )?much|ton|mil+(?:ion)|bunch)?\W*(?:<@[\dA-F]+>\W*)?$/i,
    coffee: /^(?:\W*<@[\dA-F]+>)?(?:\W*I?(?:'?[ld]+)?\W*(?:need|want|like|(?:got ?t[ao] )?(?:get|give)(?: \S+)?) (?:a |some )?)?\W*cof+e+\W*(?:please\W*|<@[\dA-F]+>\W*)*$/i,
	purgebot: /^\W*(?:<@[\dA-F]+>\W*)?purgebot(?: (\d+))?$/i,
    chicken: /\bchicken\b/i
},
chicken = '🐔',
na = '⛔',
wait = '⏳';

client.on('message', message => {
	if (message.author == client.user) //own message
		return;

    let m, nick, msg;
    msg = message.cleanContent;
    
    if ((m = re.ratio.exec(msg)) !== null) {
		// !ratio
        jeroImg(process.env.JEROENR_RATIO, m[1], message, 'ratio');
    } else if ((m = re.eligible.exec(msg)) !== null) {
		// !eligible
        jeroImg(process.env.JEROENR_ELIGIBLE, m[1], message, 'eligible');
    } else if (re.daily.test(msg)) {
		//!daily
		let quests = [	'1500 gold bars',
						'1 million coins',
						'3000 amber insulation',
						'550 insulated wire',
						'800 graphite',
						'80 circuits',
						'200 lamps',
						'800 batteries'
					],
			alaska = new Date(new Date().toLocaleString("en-US", {timeZone: 'America/Los_Angeles'})),
			index = Math.floor(alaska/8.64e7) % 8,
			dow = alaska.getUTCDate(),
			sep = ' | ';
        message.channel.send(
			'**`🕛 ' + weekDay(dow  ) + '`**  ' + quests[index]       + sep +
			'**`🕛 ' + weekDay(dow+1) + '`**  ' + quests[(index+1)%8] + sep +
			'**`🕛 ' + weekDay(dow+2) + '`**  ' + quests[(index+2)%8]
		);
	} else if ((m = re.giphy.exec(msg)) !== null) {
		//  !giphy  | !have
		
		giphy(m[1], message);
    } else if (msg.toLowerCase() == 'ping') {
		// ping
        message.channel.send(':ping_pong: pong');
    } else if (msg.toLowerCase() == 'nicktest') {
		// nicktest
        nick = getNick(message);
        message.channel.send('Hello ' + nick);
    } else if ((m = re.sendmsg.exec(msg)) !== null) {
		// !sendmsg
		const channel = findChan(m[1]);
		let allowed = 
			(message.member && message.member.hasPermission('BAN_MEMBERS'))
			|| (channel.guild && channel.guild.member(message.author) && channel.guild.member(message.author).hasPermission('BAN_MEMBERS'))
			|| false;
		if (allowed) {
			if (channel) {
				channel.send(m[2]);
			} else {
				message.channel.send(m[1] + ' ' + m[2]);
			}
		} else {
			message.react(na);
		}
	} else if (re.ruokhal.test(msg)) {
		message.channel.send(`Look, ${message.author}, I can see you're really upset about this. I honestly think you ought to sit down calmly, take a stress pill, and think things over.`);
	} else if (re.openthebay.test(msg)) {
		message.channel.send(`Alright, ${message.author}. I'll go in through the emergency airlock.`);
    } else if (re.headoff.test(msg)) {
        message.channel.send("I'm hidding behind Fireball!");
    } else if (re.coffee.test(message.content)) {
        message.channel.send(':coffee:');
    } else if (message.isMentioned(client.user) && re.thankyou.test(message.content)) {
		// Thank you @bot
		let arrAnswer = [
				'no problem!', "don't mention it :thumbsup:", "you're welcome!", 'anytime! :ok_hand:',
				"you're quite welcome, pal", ':chicken::thumbsup:', "that's alright", 'no prob', 'happy to help',
				'happy to help :robot:', "it's my pleasure", 'no worries! :ok_hand:', 'No, thank YOU',
				'it was the least I could do', 'glad to help', 'sure!', 'you got it, mate'
			],
			answer = arrAnswer[Math.floor(Math.random() * arrAnswer.length)];
        message.channel.send(answer);
    } else if ((m = re.purgebot.exec(msg)) !== null) {
		// !purgebot [N]
		let limit = m[1] || 2;
		purgeMsg(message.channel, true, limit);
		if ((message.member && message.member.hasPermission('BAN_MEMBERS')) || false) {
			message.delete().catch((err)=>{console.log(err)});
		} else {
			message.react(na);
		}
    } else if (message.isMentioned(client.user) || re.chicken.test(msg)) {
        message.react(chicken);
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

function quote(user) {
	return '<@' + user.id + '>' || user;
}

function findChan(str) {
	return client.channels.find(ch => ch.name.toLowerCase().startsWith(str.toLowerCase()));
}

function purgeMsg(channel, user, limit) {
	const max = 100; //max allowed limit without a MessageCollector
	channel
	.fetchMessages({limit: max})
	.then(chanMsg => {
		if (user === true) {
			chanMsg = chanMsg.filter(m => m.author.bot).array().slice(0, (limit||max));
		} else {
			chanMsg = chanMsg.filter(m => m.author == user).array().slice(0, (limit||max));
		}
		if (chanMsg.length) {
			channel
			.bulkDelete(chanMsg)
			.catch((e) => {console.log('Bulk Delete error: ' + e)});
		}
	})
	.catch((e) => {console.log('Fetch Messages error: ' + e)});
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

function giphy(query, message) {
	let queryString = encodeURIComponent(query);
	
	
	const
		request = require('request'),
		borderColor = 0xe0bc1b,
		rating = 'PG-13',
		giphyUrl = `https://api.giphy.com/v1/gifs/random?api_key=${process.env.GIPHY_APIKEY}&tag=${queryString}&rating=${rating}`;
	

	request.get(
		{
			url: giphyUrl,
			json: true,
			headers: {'User-Agent': 'request'}
		}, 
		(err, res, data) => {
			if (err) {
				console.log('Error in giphy request:', err);
				if (message) message.react(na);
			} else if (res.statusCode !== 200) {
				if (message) message.react(res.statusCode == 429 ? wait : na);
				console.log('Giphy response status:', res.statusCode);
			} else {
				// data is already parsed as JSON:
				if (data.data && data.data.image_url) {
					const 
						imgUrl = data.data.image_url,
						imgFilename = query.replace(/\W+/g,'-') + '.' + (data.data.type || '.gif');
					message.channel.send(
						{
							embed: {
								color: borderColor,
								title: query,
								/*description: (data.data.title || ''),*/
								image: {
									url: 'attachment://' + imgFilename
								},
								footer: {
									text: (data.data.title || '')
								}
							},
							files: [{ attachment: imgUrl, name: imgFilename }] 
						}
					)
					.catch(()=>{});
				} else {
					console.log("Giphy - No URL:\n" + JSON.stringify(data).substring(0,50));
				}
			}
		}
	)
	.catch((err)=>{console.log(err)});
}

function weekDay(dayNum) {
	return ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'][dayNum%7];
}

client.on('ready', () => {
    const buildMsg = 'Cluck cluck! :chicken:';
	const channel = client.channels.find(ch => ch.name === process.env.TEST_CHAN);
	if (channel) {
		channel.send(buildMsg);
	} else {
		console.log(buildMsg);
	}
	
	const now = new Date();
	client.user.setActivity('since '
		+ now.getUTCDate() + '/' + (now.getUTCMonth() + 1)
		+ ' ' + now.getUTCHours() + ':' + ('' + now.getUTCMinutes()).padStart(2, '0')
	, {type: "WATCHING"});
});

client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret from https://discordapp.com/developers/applications/me