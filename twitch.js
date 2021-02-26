require("dotenv").config();
require("colors");
let crypt = require('crypto');
let dayjs = require("dayjs");
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

const { promises:fs } = require("fs")
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


const { ApiClient } = require('twitch');
const { ClientCredentialsAuthProvider } = require('twitch-auth');
const { EventSubListener, ReverseProxyAdapter } = require('twitch-eventsub');
const {Client, MessageEmbed, WebhookClient, Intents} = require("discord.js");

const authProvider = new ClientCredentialsAuthProvider(twitchClientID, twitchClientSecret);
const apiClient = new ApiClient({ authProvider });
const listener = new EventSubListener(apiClient, new ReverseProxyAdapter({
    hostName: TwitchIP, // The host name the server is available from
    port: TwitchPort  // Por the server should listen to
    //externalPort: The external port (optional, defaults to 443)
}));

let tokenPeriod = setInterval(async () => {
    let pathname = "./tokens.json", options = {encoding: "utf-8"};
    let sObj = await fs.readFile(pathname, options);
    let obj = JSON.parse(sObj);

    if (obj.hours < 1) {
        obj.hours = 24;
        obj.secret = crypt.randomBytes(64).toString('hex');
    }
    else obj.hours--;
    await fs.writeFile(pathname, JSON.stringify(obj) ,options);

}, (1000 * 60 * 60))


const client = new Client( { intents: Intents.ALL } );
client.prefix = ",";
client.login(TOKEN);

client.on("ready", async () => {
    let prompt = `[Twitch] ${client.user.tag} is now online!`;
    console.log(prompt.cyan);

});


(async () => { 
    try {
        listener.listen().then(() => console.log(`Twitch EventSubListener Enabled`.green))
            
        let user = await apiClient.helix.users.getUserByName("EmperorSR")
        if (!user) return console.log(`${keyName} does not exist.`);
            
        let {displayName, id: userid} = user;
        console.log(`${displayName}:${userid}`);
            
        
        const subON = await listener.subscribeToStreamOnlineEvents(userid, e => { console.log(`${e.broadcasterDisplayName} just went live!`.cyan) });
        const subOFF = await listener.subscribeToStreamOfflineEvents(userid, e => { console.log(`${e.broadcasterDisplayName} just went offline`.cyan) });
        console.log("Sub", subON, subOFF);
                
        process.on("SIGINT", async () => {
            console.log(`Closing Script`);
            // Kill all twitch subscription listeners beforing ending script. 
            subON.stop
            subOFF.stop
            clearInterval(tokenPeriod)
            process.exit()
        });

    } catch (e) {console.log("HELPPPPPPPPP 1".red, e)}
})();


/* Saabpar */ let sbp = new WebhookClient(saabparHookID, saabparHookToken )
/* Empy */    let emp = new WebhookClient(empyHookID, empyHookToken )
/* x Test */ let test = new WebhookClient(testHookID, testHookToken )
/* Aylin */ let aylin = new WebhookClient(aylinHookID, aylinHookToken )
/* Venvi */ let venvi = new WebhookClient(venviHookID, venviHookToken )
/* Kikle */ let kikle = new WebhookClient(kikiHookID, kikiHookToken )


(async () => {
    try {
        //
    } catch (e) {console.log("HELPPPPPPPPP 2".red, e)}
})();



process.on("SIGINT", async () => {
    console.log(`Closing Script`);
    // Kill all twitch subscription listeners beforing ending script. 
    // subscription.stop().then(() => process.exit())
    process.exit()
});

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

    
    */