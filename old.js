require("dotenv").config();
require("colors");

const fs = require("fs")
const {Client, MessageEmbed, WebhookClient} = require("discord.js");

const { ApiClient } = require('twitch');
const { ClientCredentialsAuthProvider } = require("twitch-auth");
const { WebHookListener, SimpleAdapter } = require('twitch-webhooks');
// const { ClientCredentialsAuthProvider, RefreshableAuthProvider, StaticAuthProvider } = require("twitch-auth");
const {twitchClientID, twitchClientSecret} = process.env;

const client = new Client({intents: 1 << 14});
const authProvider = new ClientCredentialsAuthProvider(twitchClientID, twitchClientSecret);

// let tokenObj =  fs.readFileSync('./tokens.json', {encoding: 'UTF-8'})
// let tokenData = JSON.parse(tokenObj)
// const authProvider = new RefreshableAuthProvider( new StaticAuthProvider(twitchClientID, tokenData.accessToken), {
//         clientSecret: twitchClientSecret,
//         refreshToken: tokenData.refreshToken,
//         expiry: tokenData.expiryTimestamp === null ? null : new Date(tokenData.expiryTimestamp),
//         onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
//             const newTokenData = {
//                 accessToken,
//                 refreshToken,
//                 expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
//             };
//             fs.writeFileSync('./tokens.json', JSON.stringify(newTokenData, null, 4),  {encoding: 'UTF-8'})
//         }
//     }
// );

const apiClient = new ApiClient({ authProvider });
const listener = new WebHookListener(apiClient, new SimpleAdapter({ hostName: process.env.TwitchIP, listenerPort: process.env.TwitchPort }));

let axios = require("axios");
let dayjs = require("dayjs");
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const relativeTime = require('dayjs/plugin/relativeTime')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)
client.prefix = ","
client.login(process.env.TOKEN)


/* Empy */ let emp = new WebhookClient(process.env.empyHookID, process.env.empyHookToken)
/* Saabpar */ let sbp = new WebhookClient(process.env.saabparHookID, process.env.saabparHookToken)
/* x Test */ let test = new WebhookClient(process.env.testHookID, process.env.testHookToken);
/* Aylin */ let aylin = new WebhookClient(process.env.aylinHookID, process.env.aylinHookToken);
/* Venvi */ let venvi = new WebhookClient(process.env.venviHookID, process.env.venviHookToken);
/* Kikle */ let kikle = new WebhookClient(process.env.kikiHookID, process.env.kikiHookToken);

let streamers = {
    "EmperorSR": { hooks: [test],               subs: null, live: null }, // subs: object for subscription on/off  //live: stream object
/*
    // // Saabpar
    "saabpar": { hooks: [sbp, venvi],           subs: null, live: null },
    "TheresaaRere": { hooks: [sbp, aylin],      subs: null, live: null },
    "go_malabananas": { hooks: [sbp],           subs: null, live: null },
    "snsilentninja": { hooks: [sbp],            subs: null, live: null },
    "malandrin861": { hooks: [sbp],             subs: null, live: null },
    "whiskrskittles7": { hooks: [sbp],          subs: null, live: null },
    "yngplo": { hooks: [sbp],                   subs: null, live: null },

    // // Aylin
    "nyxnxn": { hooks: [sbp],                   subs: null, live: null },
            // "bonedipcollect": { hooks: [sbp, aylin],    subs: null, live: null },
            // "brotherpiko": { hooks: [aylin],            subs: null, live: null },
            // "mr_shorty13": { hooks: [aylin],            subs: null, live: null },
            // "lineant": { hooks: [aylin],                subs: null, live: null },
            // "trianglemikey": { hooks: [aylin],          subs: null, live: null },
            // "CHANCEBEFLYAf": { hooks: [aylin],          subs: null, live: null },

    // // Kikle
    "xkiklex": { hooks: [kikle],                subs: null, live: null },

    // // Personal
    "michaelreeves": { hooks: [emp],            subs: null, live: null },
    // "xQcOW": { hooks: [emp],                 subs: null, live: null },
    // "Souljaboy": { hooks: [emp],             subs: null, live: null },
    // "Smii7y": { hooks: [emp],                subs: null, live: null },
*/
}


client.on("ready", async () => {
    test.send("Ready Event Handler Initiated")
    console.log(`[Twitch] ${client.user.tag} is now online!`.green);

    //Register to the twitch event listener
    await listener.listen();
    console.log(`Twitch listener online on port ${process.env.TwitchPort}, Loading Streamers. . .`.green);
    
    for (let keyName in streamers) {
        // fetch user profile data
        let user = await apiClient.helix.users.getUserByName(keyName)
        if (user) {
            let {displayName, id, offlinePlaceholderUrl, profilePictureUrl} = user;
            let userid = id;

            console.log(`Loading Streamer ${displayName}...`.yellow);

            //fetch twitch stream data if it exists
            let prevStream = await apiClient.helix.streams.getStreamByUserName(displayName); 
            if (prevStream) streamers[keyName].live = prevStream; // According to bot, it sees there is already a stream in progress.

            //Create a listener to specific user's stream, hook onto it for ongoing updates
            const subscription = await listener.subscribeToStreamChanges(userid, async (stream) => {
                
                if (stream) { // if the user is currently streaming
                    streamers[keyName].live = stream; // update local storage of user's stream data
                    let { gameId, id, startDate, thumbnailUrl, title, type, userDisplayName} = stream;
                    let streamId = id, embed = new MessageEmbed();

                    
                    test.send(`${userDisplayName} event executed`)



                    if (!prevStream) { // User just started the stream.
                        embed.setTitle(`${userDisplayName} is streaming!`);
                        embed.addField(title, `Started Streaming: ${dayjs(startDate).tz("America/Los_Angeles").format('MM/DD/YYYY hh:mm:ssa')} PST`);
                    } 
                    
                    
                    else { // User has been streaming and there was a change
                        embed.fields.length = 0; // Erase previous titles if there are any.
                        embed.addField(title, `Updated Stream: ${dayjs().tz("America/Los_Angeles").format('MM/DD/YYYY hh:mm:ssa')} PST`);
                    }

                    // Fetch the image provided by twitch's livestream URL property with axios (bypassing Discord's Cache Problem)
                    let fetchLive = await axios.get(thumbnailUrl.replace("-{width}x{height}", ""), {responseType: 'arraybuffer'})
                    embed.attachFiles([{name: "livestream.png", attachment: fetchLive.data}]).setImage('attachment://livestream.png')
                    
                    
                    let game = await stream.getGame();
                    if (game) { // Fetch Game Data for the current moment
                        let newBoxStr = game.boxArtUrl.replace("-{width}x{height}", "")
                        let fetchGamePic = await axios.get(newBoxStr.replace("-{width}x{height}", ""), {responseType: 'arraybuffer'})
                        embed.attachFiles([{name: "game.png", attachment: fetchGamePic.data}]).setThumbnail('attachment://game.png')
                        // embed.setThumbnail(newBoxStr)
                    }
                    
                    embed.setFooter(`userid: ${userid} | streamid: ${streamId} | gameid: ${gameId} | type: ${type}`, profilePictureUrl)
                    embed.setDescription(`Stream Link: [https://www.twitch.tv/${displayName}](https://www.twitch.tv/${displayName})`);
                  
                    streamers[keyName].hooks.every(hook => hook.send({embeds: [embed]})) 
                
                } 
                
                else { // user is no longer streaming
                    embed = new MessageEmbed();
                    if (offlinePlaceholderUrl) embed.setImage(offlinePlaceholderUrl)
                    if (streamers[keyName].live) {
                        let durationSince = dayjs().from(streamers[keyName].live.startDate, true)
                        embed.addField(`Thank you for coming!`, `Streamed for ${durationSince}`)
                    }
                    
                    // no stream, User is now offline.
                    embed.setThumbnail(profilePictureUrl)
                    embed.setTitle(`${displayName} is now offline.`)
                    embed.setFooter(`Time: ${dayjs().tz("America/Los_Angeles").format('MM/DD/YYYY hh:mm:ssa')} PST`, profilePictureUrl)

                    // streamers[keyName].streamers[keyName].live = null;
                    streamers[keyName].live = null;

                    streamers[keyName].hooks.every(hook => hook.send({embeds: [embed]})) 

                }

            });

            subscription.start().then(() => {
                // streamers[keyName].sub = subscription;
                streamers[keyName].subs = subscription;
                console.log(`Hooked ${displayName}:${id}`.grey);
            })
        }
    }
    console.log("Done!".cyan)
})


process.on("SIGINT", async () => {
    // Kill all twitch subscription listeners beforing ending script. 
    for (x in streamers) streamers[x].subs ? streamers[x].subs.stop() : null;
    process.exit()
})
