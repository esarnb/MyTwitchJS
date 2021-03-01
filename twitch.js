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
let listenerToken = 0;
let tokenPeriod = setInterval(async () => {
    let pathname = "./tokens.json", options = {encoding: "utf-8"};
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

});


/**
 * 
 *         Promise friendly function call initializes 
 *          subscription to livestream and offstream.    
 *                
 */
(async () => { 
    try {
        listener.listen().then(() => console.log(`Twitch EventSubListener Enabled`.green));
        
        // User profile data for offline usage & subscription search by userid
        let user = await apiClient.helix.users.getUserByName("EmperorSR")
        if (!user) return console.log(`${keyName} does not exist.`);
        let {displayName, id: userid} = user;
        console.log(`${displayName}:${userid}`);
        
        // All event handlers are accessed by "subscribeToStreamXXXEvents". Check parameter e for several property changes.
        const subON = await listener.subscribeToStreamOnlineEvents(userid, e => { console.log(`${e.broadcasterDisplayName} just went live!`.yellow) });
        const subChange = await listener.subscribeToChannelUpdateEvents(userid, e => { console.log(`${e.streamTitle} [title change]`.yellow) });
        const subOFF = await listener.subscribeToStreamOfflineEvents(userid, e => { console.log(`${e.broadcasterDisplayName} just went offline`.yellow) });
        console.log("Sub", subON, subOFF);
        
        // Script end SIGINT callback defined to stop all ongoing subscriptions.
        process.on("SIGINT", async () => {
            console.log(`Closing Script`);
            // Kill all twitch subscription listeners & token interval beforing ending script. 
            clearInterval(tokenPeriod);
            await subON.stop()
            await subChange.stop()
            await subOFF.stop()
            process.exit();
        });

    } catch (e) {console.log("Lister & Subscription Error: ".red, e)}
})();


/* Saabpar */ let sbp = new WebhookClient(saabparHookID, saabparHookToken )
/* Empy */    let emp = new WebhookClient(empyHookID, empyHookToken )
/* x Test */ let test = new WebhookClient(testHookID, testHookToken )
/* Aylin */ let aylin = new WebhookClient(aylinHookID, aylinHookToken )
/* Venvi */ let venvi = new WebhookClient(venviHookID, venviHookToken )
/* Kikle */ let kikle = new WebhookClient(kikiHookID, kikiHookToken )


/*

    let streamers = {
        "EmperorSR": { hooks: [test], subs: null, live: null }, // subs: object for subscription on/off  //live: stream object
        
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
    }

    
    (async () => {
    try {
        //
    } catch (e) {console.log("HELPPPPPPPPP 2".red, e)}
    })();

    */