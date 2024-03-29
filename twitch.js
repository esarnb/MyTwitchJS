require("dotenv").config();
// SSL handled by LetsEncrypt Certbot instead of Cloudflare Origin Certs //


require("colors");
const dayjs = require("dayjs");
const axios = require("axios");
const crypt = require('crypto');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const relativeTime = require('dayjs/plugin/relativeTime');

const fs = require("fs")
const { ApiClient } = require('twitch');
const { ClientCredentialsAuthProvider } = require('twitch-auth');
const { EventSubListener, ReverseProxyAdapter, DirectConnectionAdapter } = require('twitch-eventsub');
const {Client, MessageEmbed, WebhookClient, Intents} = require("discord.js");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

const {
    TOKEN, TwitchIP, TwitchPort, 
    twitchClientID, twitchClientSecret, 
    empyHookID, empyHookToken, 
    saabparHookID, saabparHookToken, 
    testHookID, testHookToken, 
    aylinHookID, aylinHookToken, 
    venviHookID, venviHookToken, 
    kikiHookID, kikiHookToken,
    theresaaHookID, theresaaHookToken,
    chellemoosHookID, chellemoosHookToken
} = process.env;

/**
 * 
 *       Changing token for EventListener ID Uniqueness,
 *     but needs to be persistent between server restarts. 
 * 
 */
let pathname = "./tokens.yaml", options = {encoding: "utf-8"};
let getToken = fs.readFileSync(pathname, options);
let parseToken = JSON.parse(getToken)
let listenerToken = parseToken.secret;

/*
//          No longer changing token, needs to be static unless every time you change key, you need to use
//                  apiClient.helix.eventSub.deleteAllSubscriptions().then(() => console.log("done"));

    // Changing the token every 7 days [only if script is continuously online]
    let tokenPeriod = setInterval(async () => {
        let sObj = await fs.promises.readFile(pathname, options);
        let obj = JSON.parse(sObj);

        if (obj.hours < 1) obj.secret = crypt.randomBytes(64).toString('hex'), obj.hours = 168;
        else obj.hours--;
        await fs.writeFile(pathname, JSON.stringify(obj) ,options);
        listenerToken = obj.secret;
    }, (1000 * 60 * 60));
*/

/**
 * 
 *       Twitch d-fischer libraries & Listener location,
 *     SSL Certified hostname and port necessary to get data. 
 * 
 */
const authProvider = new ClientCredentialsAuthProvider(twitchClientID, twitchClientSecret);
const apiClient = new ApiClient({ authProvider });
const listener = new EventSubListener(apiClient, new ReverseProxyAdapter({
    hostName: TwitchIP, // The host name the server is available from
    port: TwitchPort,  // Por the server should listen to = default 8080
    externalPort: 443, // The external port (optional, defaults to 443)
    // pathPrefix: "/twitch"
}), listenerToken);


/**
 * 
 *         Discord Webhook & Client library connections,
 *     Bot doesn't need to be in discord server for Webhooks.
 * 
 */
const client = new Client( { intents: Intents.ALL } );
client.prefix = ",";
client.login(TOKEN);

client.on("ready", async () => {
    let prompt = `[Twitch] ${client.user.tag} is now online!`;
    console.log(prompt.cyan);
    client.users.resolve("251091302303662080").send(prompt)
});


/* Saabpar */ let sbp = new WebhookClient(saabparHookID, saabparHookToken);
/* Empy */    let emp = new WebhookClient(empyHookID, empyHookToken);
/* x Test */ let test = new WebhookClient(testHookID, testHookToken);
/* Aylin */ let aylin = new WebhookClient(aylinHookID, aylinHookToken);
/* Venvi */ let venvi = new WebhookClient(venviHookID, venviHookToken);
/* Kikle */ let kikle = new WebhookClient(kikiHookID, kikiHookToken);
/* Theresaa */ let theresaa = new WebhookClient(theresaaHookID, theresaaHookToken);
/* chellemoos */ let chellemoos = new WebhookClient(chellemoosHookID, chellemoosHookToken);

/**
 * 
 *          Single giant object to store twitch users set,
 *     Each user has respective unique properties of default null, 
 *          filled in throughout the subscription process 
 * 
 */
let streamers = {
    // testing 
    "EmperorSR": { hooks: [test],                     subs: {online: null, offline:null, stream: null}, started: null, game: null }, 
    
    // // Saabpar
    "saabpar": { hooks: [sbp, venvi],                      subs: {online: null, offline:null, stream: null}, started: null, game: null },
    "TheresaaRere": { hooks: [sbp, aylin, theresaa],                 subs: {online: null, offline:null, stream: null}, started: null, game: null },
    "go_malabananas": { hooks: [sbp],                      subs: {online: null, offline:null, stream: null}, started: null, game: null },
    "snsilentninja": { hooks: [sbp],                       subs: {online: null, offline:null, stream: null}, started: null, game: null },
    "Backwoodraider": { hooks: [sbp],                      subs: {online: null, offline:null, stream: null}, started: null, game: null },
    "whiskrskittles7": { hooks: [sbp],                     subs: {online: null, offline:null, stream: null}, started: null, game: null },
    "yngplo": { hooks: [sbp],                              subs: {online: null, offline:null, stream: null}, started: null, game: null },

    // // Aylin
    "nyxnxn": { hooks: [sbp],                              subs: {online: null, offline:null, stream: null}, started: null, game: null },
            // "bonedipcollect": { hooks: [sbp, aylin],    subs: {online: null, offline:null, stream: null}, started: null, game: null },
            // "brotherpiko": { hooks: [aylin],            subs: {online: null, offline:null, stream: null}, started: null, game: null },
            // "mr_shorty13": { hooks: [aylin],            subs: {online: null, offline:null, stream: null}, started: null, game: null },
            // "lineant": { hooks: [aylin],                subs: {online: null, offline:null, stream: null}, started: null, game: null },
            // "trianglemikey": { hooks: [aylin],          subs: {online: null, offline:null, stream: null}, started: null, game: null },
            // "CHANCEBEFLYAf": { hooks: [aylin],          subs: {online: null, offline:null, stream: null}, started: null, game: null },

    // // Kikle
    "xkiklex": { hooks: [kikle],                           subs: {online: null, offline:null, stream: null}, started: null, game: null },

     // // chellemoos
     "chellemoos": { hooks: [chellemoos],                  subs: {online: null, offline:null, stream: null}, started: null, game: null },

    // // Personal
    "michaelreeves": { hooks: [emp],                       subs: {online: null, offline:null, stream: null}, started: null, game: null },
    // "xQcOW": { hooks: [emp],                            subs: {online: null, offline:null, stream: null}, started: null, game: null },
    // "Souljaboy": { hooks: [emp],                        subs: {online: null, offline:null, stream: null}, started: null, game: null },
    // "Smii7y": { hooks: [emp],                           subs: {online: null, offline:null, stream: null}, started: null, game: null },
};


/**
 * 
 *         Promise friendly function call initializes 
 *          subscription to livestream and offstream.    
 *                
 */
(async () => { 
    try {
        await listener.listen();
        console.log(`Twitch EventSubListener Enabled`.brightGreen);
        
        // //       Instant fix to all my life's problems
        // apiClient.helix.eventSub.deleteAllSubscriptions().then(() => console.log("done"));
        // return;

        for (const [name, person] of Object.entries(streamers)) {
            
            // User profile data for offline usage & subscription search by userid
            let user = await apiClient.helix.users.getUserByName(name)
            if (!user) console.log(`${name} does not exist.`.brightYellow);
            else {
                let {displayName, id: userid} = user;
                console.log(`Subscribing to ${displayName}:${userid}`.brightMagenta);
    
                // All event handlers are accessed by "subscribeToStreamXXXEvents". Check parameter e for several property changes.
                streamers[name].subs.online = await listener.subscribeToStreamOnlineEvents(userid, async e => {
                    // console.log(e.broadcasterDisplayName, e.broadcasterId, e.broadcasterName, e.startDate, e.streamType);
                    console.log(`EVENT ONLINE: ${e.broadcasterDisplayName}`.brightCyan);
                    streamers[name].started = e.startDate;
                    let embed = new MessageEmbed()
                        .setThumbnail(user.profilePictureUrl)
                        .setTitle(`${e.broadcasterDisplayName} ${e.streamType === "live" ? "just went" : "is"} ${e.streamType}!`)
                        .setFooter(`broadcasterID: ${e.broadcasterId} | Stream Type: ${e.streamType}`)
                        .setDescription(`Currently Streaming [here](https://twitch.tv/${e.broadcasterName})! \nStarted Streaming: ${dayjs(e.startDate).tz("America/Los_Angeles").format('MM/DD hh:mma')} PST\n\`+2 CST | +3 EST | +8 UTC\``);
                    
                    // Fetch the image provided by twitch's livestream URL property with axios (bypassing Discord's Cache Problem)
                    let { thumbnailUrl } = await apiClient.helix.streams.getStreamByUserId(userid);
                    let fetchLive = await axios.get(thumbnailUrl.replace("-{width}x{height}", ""), {responseType: 'arraybuffer'})
                    embed.attachFiles([{name: "livestream.png", attachment: fetchLive.data}]).setImage('attachment://livestream.png')
 
                     
                    streamers[name].hooks.every(async (channel) => { await channel.send({embeds: [embed]}) });

    
                });
                streamers[name].subs.stream = await listener.subscribeToChannelUpdateEvents(userid, async e => {
                    // console.log(e.broadcasterDisplayName, e.broadcasterId, e.broadcasterName, e.categoryId, e.categoryName, e.isMature, e.streamLanguage, e.streamTitle);
// @DEPRECATED: e.userDisplayName, e.userId, e.userName, e.getUser();
                    console.log(`EVENT CHANGE: ${e.broadcasterDisplayName}`.brightCyan);
                    let embed = new MessageEmbed().setTitle(`${name} made a channel update:`) .setDescription(`\`\`\`dsconfig\n${e.streamTitle}\`\`\`\n`)
                    .setFooter(`Category: ${e.categoryName} | Language: ${e.streamLanguage} | Mature Only: ${e.isMature}`);
                    
                    let game = await e.getGame();
                    if (game) {
                        embed.addField("Game", game.name);
                        let newBoxStr = game.boxArtUrl.replace("-{width}x{height}", "")
                        let fetchGamePic = await axios.get(newBoxStr.replace("-{width}x{height}", ""), {responseType: 'arraybuffer'})
                        embed.attachFiles([{name: "game.png", attachment: fetchGamePic.data}]).setThumbnail('attachment://game.png')
                    }

                    //              What if I use apiHelix to get .stream data instead of relying on broadcaster?

                    // { gameId, id, language, startDate, tagIds, thumbnailUrl, title, type, userDisplayName, userId, userName, viewers }
                    // methods  getGame, getTags, getThumbnailUrl, getUser

                    // DO NOT DECONSTRUCT METHODS, they use .this so it would lose _data if deconstructed.
                    let { thumbnailUrl, startDate, viewers } = await apiClient.helix.streams.getStreamByUserId(userid);

                    // Fetch the image provided by twitch's livestream URL property with axios (bypassing Discord's Cache Problem)
                    let fetchLive = await axios.get(thumbnailUrl.replace("-{width}x{height}", ""), {responseType: 'arraybuffer'})
                    embed.attachFiles([{name: "livestream.png", attachment: fetchLive.data}]).setImage('attachment://livestream.png')

                    // setup currently online or offline embed for each channel change.
                    startDate ? streamers[name].started = startDate : streamers[name].started = null;
                    streamers[name].started ? embed.addField(`Currently Streaming!`,`Streaming for about ${dayjs(streamers[name].started).fromNow(true)} [here](https://twitch.tv/${e.broadcasterName})!`) : embed.addField("Not currently streaming.", "Streamer is offline.");
                    
                    // setup thumbnail of stream onto embed
                    // ERROR: Cannot read property '_data' of undefined
                    // SOLUTION: it is because deconstructing a function loses {this} context, so it couldn't find _data.

                            // let thumbnailStream = getThumbnailUrl(300, 400);
                            // console.log(await getThumbnailUrl(300, 400));
                    
                    // solution 1
                    // let myThumbnail = (await apiClient.helix.streams.getStreamByUserId(userid)).getThumbnailUrl(300,400);
                    // embed.setImage(myThumbnail)

                    // solution 2
                    // if (thumbnailUrl) embed.setImage(thumbnailUrl.replace("-{width}x{height}", ""))
                            
                    // setup viewers field if there are any
                    if (viewers) embed.addField("Viewers", viewers + " currently watching.");
                            
                    // setup tags field if there are any
                    // ERROR: Cannot read property '_client' of undefined
                            // let tagStream = await getTags() 
                            // tagStream = tagStream.map(x => x.getName());
                            // embed.addField("Tags", tagStream.join(" | "))

                    streamers[name].hooks.every(async (channel) => { await channel.send({embeds: [embed]}) });
                    

    
                });
                streamers[name].subs.offline = await listener.subscribeToStreamOfflineEvents(userid, e => {
                    // console.log(e.broadcasterDisplayName, e.broadcasterId, e.broadcasterName);
                    console.log(`EVENT OFFLINE: ${e.broadcasterDisplayName}`.brightCyan);
                    
                    let embed = new MessageEmbed()
                        .setTitle(`${e.broadcasterDisplayName} just went offline`)
                        .setThumbnail(user.profilePictureUrl)
                        .setDescription(`Streamed for ${dayjs(streamers[name].started).fromNow(true)}`)
                    streamers[name].hooks.every(async (channel) => { await channel.send({embeds: [embed]}) });

                    streamers[name].started = null;
                });
            }
        }
        console.log("Finished subscription to streamers.".green);
        // List out amount of webhooks registered to the client // https://d-fischer.github.io/versions/4.4/twitch/reference/classes/HelixEventSubApi.html#getSubscriptionsPaginated
        console.log( await apiClient.helix.eventSub.getSubscriptionsPaginated().getTotalCount() + " hooks enabled.".green)

        // Script end SIGINT callback defined to stop all ongoing subscriptions.
        process.on("SIGINT", async () => {
            console.log(`Closing Script`);
            // Kill all twitch subscription listeners & token interval beforing ending script.
            // @ALTERNATIVE  maybe try https://d-fischer.github.io/versions/4.4/twitch/reference/classes/HelixEventSubApi.html#getSubscriptionsPaginated
            const streams = Object.values(streamers).flatMap(streamer => [
                streamer.subs.online.stop(), streamer.subs.stream.stop(), streamer.subs.offline.stop()
            ]);
            await Promise.all(streams);
            process.exit();
            
        });

    } catch (e) {console.log("Lister & Subscription Error: ".brightRed, e)}
})();