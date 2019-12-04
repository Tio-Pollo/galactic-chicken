var client;

const EnvName  = (process.env.ENV_NAME || 'unidentified environment');
const StartDay = (parseInt(process.env.ACTIVE_STARTDAY,10) || 99); // 15
const EndDay   = (parseInt(process.env.ACTIVE_ENDDAY,10) || 0);    // 32
const BuildDay = new Date().getUTCDate();
const haltOffset = 2;
const DTG = [];

if (!activeBot(haltOffset)) {
	console.log('Halting ' + EnvName + ' for inactive period (only active from day ' + StartDay + ' to day ' + (EndDay-1) + ')');
} else {
	
	if ( !activeBot() ) {
		console.log('Ducking ' + EnvName + ' during grace period (only active from day ' + StartDay + ' to day ' + (EndDay-1) + ')');
	}

	const { Client, Attachment } = require('discord.js');
	client = new Client();
	
	
}

function initVars() {
	getDTG();
}

const re = {
    ratio: /^\W*ratio(?:(?!.*updated?\W*$) +@?(\S+(?:\s+\S+){0,2})\s*)?$/i,
    eligible: /^\W*eligib(?:le|ility)(?:(?!.*updated?\W*$) +@?(\S+(?:\s+\S+){0,2})\s*)?$/i,
    daily: /^\W*(?:<@[\dA-F]+>\W*)?daily$/i,
    guide: /^\W*(?:<@[\dA-F]+>\W*)?(?:(?:d(?:eep)?)?(?:t(?:own)?)?guide|dtg)\s+((?:\w\W*){3}.*)/i,
    giphy: /^\W*[^\w\s]\W*(?:giphy|have)\s+(?:(?:a|the|one|some|this)\s+)*(\S.*)/i,
    help: /^(?:\W*(?:[^\w\s]|(<@[\dA-F]+>))\W*)help(?:\s+(\S+))?$/i,
    sendmsg: /^! ?sendmsg +(\S+) (.+)/i,
    headoff: /^\W*off with his head\b/i,
    ruokhal: /\bI know everything has\W*n\W*t been quite \w* ?right with me\b/i,
    openthebay: /\bI know (?:that )?you and \w+\W.{0,2}re plan+ing to discon+e/i,
    beerfireball: /^Sorry no beer here[\s\S]*I only drink Valvoline Valtorque C4 Transmission Fluid/,
    thankyou: /^(?:\W*<@[\dA-F]+>)?\W*t(?:hank[ syoua]*| *y[ aou]*)(?:lot|(?:very )?much|ton|mil+(?:ion)|bunch)?\W*(?:<@[\dA-F]+>\W*)?$/i,
    coffee: /^(?:\W*<@[\dA-F]+>)?(?:\W*I?(?:'?[ld]+)?\W*(?:need|want|like|(?:got ?t[ao] )?(?:get|give)(?: \S+)?) (?:a |some )?)?\W*cof+e+\W*(?:please\W*|<@[\dA-F]+>\W*)*$/i,
    purgebot: /^\W*(?:<@[\dA-F]+>\W*)?purge(bot|me)(?: (\d+))?$/i,
    chicken_env: /^\W*chicken[^a-z]*env\w*\W*$/i,
    logline: /^\W\W*log (.+)/i,
    chicken: /\bchicken\b/i
},
chicken = '🐔',
na = '⛔',
wait = '⏳';

const help = [
	{
		name: 'commands',
		trigger: 'Help', 
		desc: "Shows all available commands",
		react: '❓'
	},
	{
		name: 'ratio',
		trigger: '!ratio [*optional* user]', 
		desc: "Shows a user's ratio (sent / received donations).\nUpdated every week, about a day after the event ends.\nAlso shows date of last update.\nYou should try to keep a ratio of at least 1 or more.",
		react: '⚖'
	},
	{
		name: 'eligible',
		trigger: '!eligible [*optional* user]',
		desc: "Eligibility score to become the next focus for fireballing (i.e. receiving solar panels to max energy),\nIn order to prevent leeching, only users with a score > 50 become eligible.\nCheck <#443293220605263873> and make sure to have your info updated in the sheet.",
		react: '🛰'
	},
	{
		name: 'daily',
		trigger: '?daily',
		desc: "Items required on the daily event with current dates.",
		react: '📆'
	},
	{
		name: 'giphy',
		trigger: '?giphy <term>',
		desc: "Replies with a random meme. Powered by Giphy.",
		react: '🎞'
	},
	{
		name: 'guide',
		trigger: '?guide <item|building>',
		desc: "Scrapes info from DeepTownGuide.",
		react: '🔖'
	}
];
help[0].desc = help.map((item) => item.react+' '+item.trigger).join("\n");



// --------->
// --------->

if (client) {
	
client.on('message', message => {
	let msg = message.cleanContent;
	
    let botIsActive = activeBot();
    if (!botIsActive && (!client || msg.toLowerCase() != '!chicken-env')) return;
    if (message.author == client.user) //own message
		return;
	
	//ignored users
	if (message.member && message.member.roles && message.member.roles.some(role => /\bSquib\b/i.test(role.name)))
		return;

    let m, nick;
    
    if ((m = re.ratio.exec(msg)) !== null) {
		// !ratio
		let query = m[1],
			user;
		
		if (!query) {
			user = message.author;
		} else if (((m = re.ratio.exec(message.content)) !== null) && /^<@[\dA-F]+>\s*$/i.test(m[1])) {
			user = message.mentions.users.first() || false;
			query = message.guild.member(user).nickname || query;
		}
        jeroImg(process.env.JEROENR_RATIO, query, message, 'ratio', user);
    } else if ((m = re.eligible.exec(msg)) !== null) {
		// !eligible
		let query = m[1],
			user;
		
		if (!query) {
			user = message.author;
		} else if (((m = re.ratio.exec(message.content)) !== null) && /^<@[\dA-F]+>\s*$/i.test(m[1])) {
			user = message.mentions.users.first() || false;
			query = message.guild.member(user).nickname || query;
		}
        jeroImg(process.env.JEROENR_ELIGIBLE, query, message, 'eligible', user);
    } else if (re.daily.test(msg)) {
	    //!daily
	    let quests = [
			'80 circuits',
			'200 lamps',
			'800 batteries',
			'1500 gold bars',
			'1 million coins',
			'3000 amber insulation',
			'550 insulated wire',
			'800 graphite'
		],
	    len = quests.length,
	    alaska = new Date(new Date().toLocaleString("en-US", {timeZone: 'America/Los_Angeles'})),
	    index  = Math.floor(alaska.getUTCDate()) % len,
	    index2 = Math.floor(addDays(alaska, 1).getUTCDate()) % len,
	    index3 = Math.floor(addDays(alaska, 2).getUTCDate()) % len,
	    dow = alaska.getUTCDay(),
	    sep = ' | ';
            message.channel.send(
			'**`🕛 ' + weekDay(dow  ) + '`**  ' + quests[index ] + sep +
			'**`🕛 ' + weekDay(dow+1) + '`**  ' + quests[index2] + sep +
			'**`🕛 ' + weekDay(dow+2) + '`**  ' + quests[index3]
		);
	} else if ((m = re.giphy.exec(msg)) !== null) {
		//  !giphy  | !have
		
		giphy(m[1], message);
	} else if ((m = re.guide.exec(msg)) !== null) {
		//  ?guide
		
		searchDTG(message, m[1]);
	} else if ((m = re.help.exec(message.content)) !== null) {
		// ?help
		if (m[1] && message.mentions.users.first() != client.user) return; //if @user isn't bot
		
		replyHelp(message, m[2]);
    } else if (msg.toLowerCase().replace(/[^a-z]+/ig,'') == 'ping') {
		// ping
        message.channel.send(':ping_pong: pong');
    } else if (msg.toLowerCase() == '!avatar') {
		// !avatar
        message.channel.send((message.mentions.users.first() || message.author).avatarURL);
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
	} else if (re.beerfireball.test(msg)) {
		message.channel
		.send(
			`Don't pay attention to ${message.author}, he's so uptight!\n` +
			`*Beer is the cause of and solution to all life's problems*\n` +
			`Here, have one on me! :beers:`
		).then((sentMsg) => {
			giphy('beer', sentMsg);
		})
		.catch((e) => console.log('Beer error',e));
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
		let me = m[1].toLowerCase() == 'me', 
			limit = m[2] || (me ? 10 : 2),
			target = (me ? message.author : true);
		if ((message.member && message.member.hasPermission('BAN_MEMBERS')) || false) {
			message
			.delete()
			.catch((err)=>{console.log(err)})
			.finally( () => {
				purgeMsg(message.channel, target, limit)
			});
		} else {
			message.react(na);
		}
    } else if ((m = re.logline.exec(msg)) !== null) {
		// !log ...
		console.log(m[1]);
    } else if (re.chicken_env.test(msg)) {
		message.channel.send(EnvName + (botIsActive ? '' : ' on hold and waiting ') +' from ' + BuildDay + ' (active from ' + StartDay + ' to ' + (EndDay - 1) + ')');
    } else if (message.isMentioned(client.user) || re.chicken.test(msg)) {
        message.react(chicken);
    } else if (/^\W*getdtg/i.test(msg)) {
		getDTG(message);
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

async function reactInOrder(message, arrReactions) {
	for (let r of arrReactions) {
		if (r) {
			await message.react(r).catch(e => console.log('Error in reactIO:', e));
		}
	}
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

function jeroImg(baseUrl, query, message, prefix='', withThumb = false) {
	if (!query) query = getNick(message);
        query = query.trim();
        if (prefix) prefix = prefix + '_';
	
	const imgName = encodeURIComponent(query),
		imgUrl = baseUrl + '?q=' + imgName,
                imgSafeName = query.replace(/\W+/g, '_'),
		imgFilename = prefix + imgSafeName + '.png',
		borderColor = 0xe0bc1b,
		icon = withThumb.displayAvatarURL || (message.mentions.users.first() || message.author).displayAvatarURL;
	
	let embed = {
			embed: {
				color: borderColor,
				image: {
					url: 'attachment://' + imgFilename
				}
			},
			files: [{ attachment: imgUrl, name: imgFilename }] 
		};
	if (withThumb) {
		embed.embed.author = { name: query, icon_url: icon};
	}

	message.channel
	.send(embed)
	.catch(() => {});
}

function giphy(query, message) {
	let queryString = encodeURIComponent(query).replace(/%20/g, ' ');
	
	
	const
		request = require('request'),
		borderColor = 0xe0bc1b,
		rating = 'PG-13',
		giphyUrl = `https://api.giphy.com/v1/gifs/random?api_key=${process.env.GIPHY_APIKEY}&tag=${queryString}&rating=${rating}`;
	
	try {
		request.get(
			{
				url: giphyUrl,
				json: true
				/*,
				headers: {'User-Agent': 'request'} */
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
					if (data.data) {
						const imgUrl = (data.data.image_url || (data.data.images ? (data.data.images.fixed_height || data.data.images.downsized || {url: null}).url : null));
						if (imgUrl) {
							const imgFilename = query.replace(/\W+/g,'-') + '.' + (data.data.type || '.gif');
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
							message.react(na);
						}
					} else {
						console.log("Giphy - No URL:\n" + JSON.stringify(data).substring(0,180));
						message.react(na);
					}
				}
			}
		);
	} catch (err) {
		console.log('Giphy error', err);
		message.react(wait);
	}
}


function getDTG(message) {
	//let queryString = encodeURIComponent(query).replace(/%20/g, ' ');
	
	const
		request = require('request'),
		jsdom = require("jsdom"),
		{ JSDOM } = jsdom,
		dtgUrls = [
			'https://deeptownguide.com/Buildings',
			'https://deeptownguide.com/Items'
		];
	
	try {
		DTG.length = 0;
		
		for (let dtgPage of dtgUrls) {
			request.get(
				{
					url: dtgPage,
					json: false
					/*,
					headers: {'User-Agent': 'request'} */
				}, 
				(err, res, data) => {
					if (err) {
						console.log('Error in Get DTG request:', err);
						if (message) message.react(na);
					} else if (res.statusCode !== 200) {
						if (message) message.react(res.statusCode == 429 ? wait : na);
						console.log('Get DTG response status:', res.statusCode);
					} else {
						if (data) {
								/*message.channel.send(
									{
										embed: {
											color: borderColor,
											title: query,
											/*description: (data.data.title || ''),  *  /
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
								.catch(()=>{});*/
							/*if (message && message.channel) {
								message.channel.send(data.substring(0,200));
							} else {
								console.log(data);
							}*/
							
							const { document } = (new JSDOM(data)).window;
							for (let tbl of document.querySelectorAll('table')) {
								// <--
								//if (message) message.channel.send('Found table: ' + tbl.getAttribute('id') + '  aaa ' + tbl.attributes.getNamedItem('id'));
								let trs = tbl.querySelectorAll('tbody > tr');  // <--
								
								for (let tr of tbl.querySelectorAll('tbody > tr')) {
									let name = tr.querySelector('td').textContent.replace(/^[\s\xA0]+|[\s\xA0]+$/g,'') || null;
									let href = tr.querySelector('td a').getAttribute('href').trim() || null;
									let img = tr.querySelector('td img').getAttribute('data-src').trim() || null;
									if (name != null && href != null) {
										DTG.push({
											name: name,
											href: href,
											img: img
										});
									}
								}
								
								 // <--
								//if (message) message.channel.send('Name: ' + DTG[0].name + ' --- href: ' + DTG[0].href + ' --- img: ' + DTG[0].img);
							}
							/*} else {
								message.react(na);
							}*/
							
							// <--
							if (message) message.channel.send('Found rows: ' + DTG.length);
							if (message) message.channel.send(DTG.map(x => x.name).join(',').substring(0,1999));
						} else {
							console.log("Get DTG - No Data");
							if (message) message.react(na);
						}
					}
				}
			);
		}
	} catch (err) {
		console.log('Get DTG error', err);
		message.react(wait);
	}
}

function searchDTG(message, term) {
	const baseUrl = 'https://deeptownguide.com',
		  borderColor = 0x000000,
		  trim = /^[\s\xA0]+|[\s\xA0]+$/g,
		  trimRE = /^[\s\xA0]+|[\s\xA0]+$|([\s\xA0])[\s\xA0]+/g;
	term = term.toLowerCase().replace(trim,'');
	let found = DTG.find(x => x.name.toLowerCase() == term)
			 || DTG.find(x => x.name.toLowerCase().startsWith(term))
			 || DTG.find(x => x.name.toLowerCase().includes(term))
			 || DTG.find(x => x.name.replace(/\W+/g,'').toLowerCase().includes(term.replace(/\W+/g,'')));
	if (!found) {
		message.react(na);
	} else {
		const itemUrl = baseUrl + found.href,
			  itemImg = baseUrl + found.img,
			  imgFilename = 'img_' + found.name.replace(/\W+/g,'-') +'.png';
		
		const
			request = require('request'),
			jsdom = require("jsdom"),
			{ JSDOM } = jsdom;
		
		try {
			request.get(
				{
					url: itemUrl,
					json: false
				}, 
				(err, res, data) => {
					if (err) {
						console.log('Error in Get DTG_info request:', err);
					} else if (res.statusCode !== 200) {
						console.log('Get DTG_info response status:', res.statusCode);
					} else {
						if (data) {
							const { document } = (new JSDOM(data)).window;
							let txt = '';
							
							//top of page
							for (let div of document.querySelectorAll('div.container-fluid.text-center>div:not(:first-child),div.container.text-center>div:not(:first-child)')) {
								let txt_line = div.textContent.replace(trimRE,'$1') || '';
								if (txt_line.length > 0) {
									txt = txt + txt_line + "\n";
								}
							}
							//clean
							txt = txt.replace(/^(?:Type[\r\n]+(?:Raw|Crafted|Chemical|Organic)|Rarity[\r\n]+Common|Sell Price[\r\n]+0)$\n?/gim, '');
							
							//tables with info
							const getTables = [
								{
									h4_match: /is created from this recipe\s*$/i,
									h4_name: 'Recipe',
									onlyTitle: false,
									excludeItems: /^Building Name$/i,
									parse: /^(`?Items Required`?)\s*/mi,
									parseRepl: "$1\n",
									inline: false
								},
								{
									h4_match: /is used to create these items\s*$/i,
									h4_name: 'Precursor of',
									onlyTitle: true,
									sort: true,
									parse: /((?:^|, )([ \w]+)) [IVX]{1,4}(?:, \2 [IVX]{1,4})+/g,
									parseRepl: '$1 ##',
									inline: true
								},
								{
									h4_match: /is used to construct\S* th[esi]+ buildings?\s*$/i,
									h4_name: 'Builds/Upgrades',
									onlyTitle: true,
									parenthesis: ['Tier','Upgrade Level', 'Quantity'],
									inline: true
								}
							];
							let fieldsResult = [];
							
							for (let panel of document.querySelectorAll('div.panel.panel-default')) {
								//get panel title
								let panelH4 = panel.querySelector('div.panel-heading > h4');
								if (!panelH4) continue;
								let panelTitle = panelH4.textContent;
								if (!panelTitle) continue;
								//check if panel matches search
								let thisTbl = null;
								for (let aTbl of getTables) {
									if (aTbl.h4_match && aTbl.h4_match.test(panelTitle)) {
										thisTbl = aTbl;
										break;
									}
								}
								if (!thisTbl) continue;
								//get the info
								let panelResult = [];
								if (thisTbl.onlyTitle) { //only first row
									for (let panelItem of panel.querySelectorAll('div.panel-body > table.table > tbody > tr > td:first-of-type')) {
										let panelItemText = (panelItem.textContent || '').replace(trimRE,'$1');
										if (thisTbl.parenthesis) { //put extra cells in parens
											let parenTR = panelItem.parentElement;
											if (parenTR) {
												let parenthesisTextArray = [];
												for (let parenthesisItem of thisTbl.parenthesis) {
													let selTD = parenTR.querySelector(`td[data-th="{parenthesisItem}"]`),
														selTDtext;
													if (selTD && (selTDtext = selTD.textContent)) {
														parenthesisTextArray.push('`' + parenthesisItem + '` ' + selTDtext.replace(trimRE, '$1'));
													}
												}
												if (parenthesisTextArray.length) {
													panelItemText = panelItemText + '(' + parenthesisTextArray.join(' ') +')';
												}
											}
										}
										panelResult.push(panelItemText);
									}
								} else { //from each row
									for (let panelItem of panel.querySelectorAll('div.panel-body > table.table > tbody > tr > td[data-th]')) {
										let dataTH = panelItem.getAttribute('data-th');
										if (dataTH && !thisTbl.excludeItems.test(dataTH)) { //except excluded
											panelResult.push('`' + dataTH + '` ' + (panelItem.textContent || '').replace(trimRE,'$1'));
										}
									}
								}
								//add to result
								if (panelResult.length) {
									//format text in result
									if (thisTbl.sort) panelResult.sort();
									let fieldsResultText = panelResult.join(thisTbl.onlyTitle ? ', ' : "\n");
									if (thisTbl.parse) {
										fieldsResultText = fieldsResultText.replace(thisTbl.parse, thisTbl.parseRepl);
									}
									fieldsResult.push({
										name: thisTbl.h4_name,
										value: fieldsResultText,
										inline: thisTbl.inline
									});
								}
							}
							
							//Create and send EMBED
							const embedMsg = {
								embed: {
									color: borderColor,
									/*author: { 
										name: found.name, 
										icon_url: itemImg
									},*/
									title: found.name,
									url: itemUrl,
									description: txt,
									thumbnail: {
										url: 'attachment://' + imgFilename,
									},
									/*image: {
										url: 'attachment://' + imgFilename
									},*/
									footer: {
										text: 'DeepTownGuide.com',
										icon_url: 'https://i.stack.imgur.com/9icMf.png',
										url: 'https://deeptownguide.com'
									}
								},
								files: [
									{ attachment: itemImg, name: imgFilename }
								]
							};
								
							if (fieldsResult.length) {
								embedMsg.embed.fields = fieldsResult;
							}
							message.channel.send(
								embedMsg
							)
							.catch((e)=>{console.error(e)});
							
							
						} else {
							console.log("Get DTG_info - No Data");
						}
					}
				}
			);
		} catch (err) {
			console.log('Get DTG_info error', err);
		}
	}
}


function weekDay(dayNum) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'][dayNum%7];
}

function addDays(date, days) {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function helpCmd(index) {
	const cmd = help[index%(help.length)];
	const allcmds = help.map((item) =>item.react+' '+item.name)
						.join(' | ');
	
	return '**' + cmd.trigger + '**'
		+ "\n" + cmd.desc
		+ (index ? "\n\n__Commands__:\n" + allcmds : '');
}

function replyHelp(message, term) {
	let helpIndex = 0;
	if (term) {
		term = term.replace(/^\s+|[^- \w]+|\s+$|(\s)\s+/g,'$1').toLowerCase();
		helpIndex = help.findIndex(item => item.name.toLowerCase() == term);
		if (helpIndex<0) {
			helpIndex = help.findIndex(item => item.name.toLowerCase().startsWith(term));
			if (helpIndex<0) {
				helpIndex = help.findIndex(item => item.name.toLowerCase().includes(term));
				if (helpIndex<0) helpIndex = 0;
			}
		}
	}
		
	
	message.channel
	.send(helpCmd(helpIndex))
	.then(async sentMsg => {
		for (let r of help.map(i => (i.react || ''))) {
			if (r) {
				await sentMsg.react(r)
					.catch(e => console.log('Error in reactHelp:', e));
			}
		}
	})
	.catch(e => console.log('Reply help error:', e));
}

client.on('messageReactionAdd', (reaction, user) => {
	if (!activeBot()) return;
	helpIndex = help.findIndex(item => item.react == reaction.emoji.name);
	if (reaction.me && user !== client.user && reaction.count > 1 && helpIndex>=0) {
		//reaction.message.channel.send(`${user} reacted with ${reaction.emoji.name}`);
		reaction.message
		.edit(helpCmd(helpIndex))
		.catch(e => console.log('Error editing', e));
	// } else {
	//	console.log(reaction.me, user !== client.user, reaction.count > 1, help.some(item => item.react == reaction.emoji.name), reaction.users.has(client.user.id));
	}	
});

const rawEvents = {
	MESSAGE_REACTION_ADD: 'messageReactionAdd'
	//, MESSAGE_REACTION_REMOVE: 'messageReactionRemove'
};
client.on('raw', async raw => {
	if (!activeBot()) return;
	if (!rawEvents.hasOwnProperty(raw.t)) return;
	
	const {d: data} = raw;
	const user = client.users.get(data.user_id);
	const channel = client.channels.get(data.channel_id) || await user.createDM();
	
	if (channel.messages.has(data.message_id)) return; //prevent if we have cached as on normal event to react
	
	const message = await channel.fetchMessage(data.message_id);
	const emojiKey = data.emoji.id ? data.emoji.name + ':' + data.emoji.id : data.emoji.name;
	let reaction;
	if (message.reactions) { 
		reaction = message.reactions.get(emojiKey) || message.reactions.add(data);
	}
	if (!reaction) { //if last reaction removed
		const emoji = new Emoji(client.guilds.get(data.guild_id), data.emoji);
		reaction = new MessageReaction(message, emoji, 1, data.user_id === client.user.id);
	}
	client.emit(rawEvents[raw.t], reaction, user);
});

client.once('ready', () => {
	if (!activeBot()) return;
	
    const buildMsg = 'Cluck cluck! :chicken: ' + EnvName;
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

initVars();

}


// <---------
// <---------




function activeBot(grace = 0, onRecursion = false) { //1, 14, 15, 31
	const utcDate = new Date();
	const plusGrace = new Date(utcDate);  plusGrace.setDate(plusGrace.getDate() + grace);
	const fromDate = Math.max(utcDate.getUTCDate(), plusGrace.getUTCDate());
	const toDate   = utcDate.getUTCDate();
	
	let itsActive = fromDate >= StartDay && Math.min(toDate, fromDate, plusGrace.getUTCDate()) < EndDay;
	if (!itsActive && !onRecursion && client && !activeBot(haltOffset, true)) {
		try {
			console.log('destroying client...');
			client
			.destroy()
			.catch( (e) => {
				console.log('Error on destroy promise',e)
			});
		} catch (err) {
			console.log('Error destroying', err);
		}
	}
	return itsActive;
}
