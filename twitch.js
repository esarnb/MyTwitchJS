require("dotenv").config();
// SSL handled by LetsEncrypt Certbot instead of Cloudflare Origin Certs //


require("colors");
let dayjs = require("dayjs");
let crypt = require('crypto');
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
} = process.env;

/**
 * 
 *       Changing token for EventListener ID Uniqueness,
 *     but needs to be persistent between server restarts. 
 * 
 */
let pathname = "./tokens.json", options = {encoding: "utf-8"};
let getToken = fs.readFileSync(pathname, options);
let parseToken = JSON.parse(getToken)
let listenerToken = parseToken.secret;
console.log(listenerToken);

// Changing the token every 7 days [only if script is continuously online]
let tokenPeriod = setInterval(async () => {
    let sObj = await fs.promises.readFile(pathname, options);
    let obj = JSON.parse(sObj);

    if (obj.hours < 1) obj.secret = crypt.randomBytes(64).toString('hex'), obj.hours = 168;
    else obj.hours--;
    await fs.writeFile(pathname, JSON.stringify(obj) ,options);
    listenerToken = obj.secret;
}, (1000 * 60 * 60));

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
    // do something
});


/* Saabpar */ let sbp = new WebhookClient(saabparHookID, saabparHookToken );
/* Empy */    let emp = new WebhookClient(empyHookID, empyHookToken );
/* x Test */ let test = new WebhookClient(testHookID, testHookToken );
/* Aylin */ let aylin = new WebhookClient(aylinHookID, aylinHookToken );
/* Venvi */ let venvi = new WebhookClient(venviHookID, venviHookToken );
/* Kikle */ let kikle = new WebhookClient(kikiHookID, kikiHookToken );


/**
 * 
 *          Single giant object to store twitch users set,
 *     Each user has respective unique properties of default null, 
 *          filled in throughout the subscription process 
 * 
 */
let streamers = {
    // testing 
    "EmperorSR": { hooks: [test],                          subs: {online: null, offline:null, stream: null} }, 
    
    // // Saabpar
    "saabpar": { hooks: [sbp, venvi],                      subs: {online: null, offline:null, stream: null} },
    "TheresaaRere": { hooks: [sbp, aylin],                 subs: {online: null, offline:null, stream: null} },
    "go_malabananas": { hooks: [sbp],                      subs: {online: null, offline:null, stream: null} },
    "snsilentninja": { hooks: [sbp],                       subs: {online: null, offline:null, stream: null} },
    "Backwoodraider": { hooks: [sbp],                        subs: {online: null, offline:null, stream: null} },
    "whiskrskittles7": { hooks: [sbp],                     subs: {online: null, offline:null, stream: null} },
    "yngplo": { hooks: [sbp],                              subs: {online: null, offline:null, stream: null} },

    // // Aylin
    "nyxnxn": { hooks: [sbp],                              subs: {online: null, offline:null, stream: null} },
            // "bonedipcollect": { hooks: [sbp, aylin],    subs: {online: null, offline:null, stream: null} },
            // "brotherpiko": { hooks: [aylin],            subs: {online: null, offline:null, stream: null} },
            // "mr_shorty13": { hooks: [aylin],            subs: {online: null, offline:null, stream: null} },
            // "lineant": { hooks: [aylin],                subs: {online: null, offline:null, stream: null} },
            // "trianglemikey": { hooks: [aylin],          subs: {online: null, offline:null, stream: null} },
            // "CHANCEBEFLYAf": { hooks: [aylin],          subs: {online: null, offline:null, stream: null} },

    // // Kikle
    "xkiklex": { hooks: [kikle],                           subs: {online: null, offline:null, stream: null} },

    // // Personal
    "michaelreeves": { hooks: [emp],                       subs: {online: null, offline:null, stream: null} },
    // "xQcOW": { hooks: [emp],                            subs: {online: null, offline:null, stream: null} },
    // "Souljaboy": { hooks: [emp],                        subs: {online: null, offline:null, stream: null} },
    // "Smii7y": { hooks: [emp],                           subs: {online: null, offline:null, stream: null} },
};


/**
 * 
 *         Promise friendly function call initializes 
 *          subscription to livestream and offstream.    
 *                
 */
(async () => { 
    try {
        listener.listen().then(() => console.log(`Twitch EventSubListener Enabled`.green));
        
        for (const [name, person] of Object.entries(streamers)) {
            
            // User profile data for offline usage & subscription search by userid
            let user = await apiClient.helix.users.getUserByName(name)
            if (!user) console.log(`${name} does not exist.`);
            else {
                let {displayName, id: userid} = user;
                console.log(`Subscribing to ${displayName}:${userid}`.gray);
    
                // All event handlers are accessed by "subscribeToStreamXXXEvents". Check parameter e for several property changes.
                streamers[name].subs.online = await listener.subscribeToStreamOnlineEvents(userid, e => {
                    // console.log(e.broadcasterDisplayName, e.broadcasterId, e.broadcasterName, e.startDate, e.streamType);
                    let embed = new MessageEmbed()
                        .setThumbnail(user.profilePictureUrl)
                        .setTitle(`${e.broadcasterDisplayName} just went live!`)
                        .setFooter(`broadcasterID: ${e.broadcasterId} | Stream Type: ${e.streamType}`)
                        .setDescription(`Started Streaming: ${dayjs(startDate).tz("America/Los_Angeles").format('MM/DD/YYYY hh:mm:ssa')} PST`) 
                    person.hooks.every((channel) => { channel.send({embeds: [embed]}) });

    
                });
                streamers[name].subs.stream = await listener.subscribeToChannelUpdateEvents(userid, e => {
                    console.log(e.categoryId, e.categoryName, e.isMature, e.streamLanguage, e.streamTitle, e.userDisplayName, e.userId, e.userName);
                    // let userData = await e.getUser()
                    // console.log( userData);
                    let embed = new MessageEmbed().setTitle(`${name} still streaming! Update:`) .setDescription(`**x${e.streamTitle}**`)
                    .setFooter(`Category: ${e.categoryName} | Language: ${e.streamLanguage} | Mature Only ${e.isMature}`).setThumbnail(user.profilePictureUrl)
                    person.hooks.every((channel) => { channel.send({embeds: [embed]}) });
    
                });
                streamers[name].subs.offline = await listener.subscribeToStreamOfflineEvents(userid, e => {
                    // console.log(e.broadcasterDisplayName, e.broadcasterId, e.broadcasterName);
    
                    let embed = new MessageEmbed()
                        .setTitle(`${e.broadcasterDisplayName} just went offline`)
                        .setThumbnail(user.profilePictureUrl)
                        .setDescription("Streamed for x min/hr")
                    person.hooks.every((channel) => { channel.send({embeds: [embed]}) });

    
                });
            }
        }
        // Script end SIGINT callback defined to stop all ongoing subscriptions.
        process.on("SIGINT", async () => {
            console.log(`Closing Script`);
            // Kill all twitch subscription listeners & token interval beforing ending script. 
            clearInterval(tokenPeriod);
            let streams = []
            for (x in streamers) streams.push(x.subs.online.off(), x.subs.stream.off(), x.subs.offline.off());
            
            Promise.all(streams).then(() => process.exit());
            
        });

    } catch (e) {console.log("Lister & Subscription Error: ".red, e)}
})();


/*
    (async () => {
        try {
            //
        } catch (e) {console.log("HELPPPPPPPPP 2".red, e)}
    })();
*/