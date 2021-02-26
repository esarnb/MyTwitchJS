console.log(`================================= script load =================================`);
require("dotenv").config();
require("colors");


let axios = require("axios");
let dayjs = require("dayjs");
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const relativeTime = require('dayjs/plugin/relativeTime')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)


const fs = require("fs")
const {Client, MessageEmbed, WebhookClient, Intents} = require("discord.js");

const myIntents = new Intents();
myIntents.add('GUILD_PRESENCES', 'GUILD_MEMBERS');
const client = new Client( { intents: Intents.ALL } );
client.prefix = ","
client.login(process.env.TOKEN)

const { ApiClient } = require('twitch');
const { WebHookListener, SimpleAdapter } = require('twitch-webhooks');

const { ClientCredentialsAuthProvider, RefreshableAuthProvider, StaticAuthProvider } = require("twitch-auth");
const {twitchClientID, twitchClientSecret} = process.env;

// let authProvider = new ClientCredentialsAuthProvider(twitchClientID, twitchClientSecret);
// let apiClient = new ApiClient({ authProvider });

        
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


fs.promises.readFile('./tokens.json', {encoding: 'UTF-8'}).then( async (tokenObj) => {
    
    let token = JSON.parse(tokenObj)
    authProvider = new RefreshableAuthProvider( new StaticAuthProvider(twitchClientID, token.accessToken), {
            clientSecret: twitchClientSecret,
            refreshToken: token.refreshToken,
            expiry: token.expiryTimestamp === null ? null : new Date(token.expiryTimestamp),
            onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
                const newTokenData = { accessToken, refreshToken, expiryTimestamp: expiryDate?.getTime() };
                await fs.writeFile('./tokens.json', JSON.stringify(newTokenData, null, 4), {encoding: 'UTF-8'}, () => console.log("Refreshed Auth Token".purple))
            }
        }
    );

    apiClient = new ApiClient({ authProvider });
    const listener = new WebHookListener(apiClient, new SimpleAdapter({ hostName: process.env.TwitchIP, listenerPort: process.env.TwitchPort }));
    listener.listen().then(() => { console.log(`Now listening to Twitch Event Listener `.green) })    

    client.on("ready", async () => {
        let prompt = `[Twitch] ${client.user.tag} is now online!`;
        test.send(prompt)
        console.log(prompt.green);
    
let keyName = "EmperorSR"   
    
        let user = await apiClient.helix.users.getUserByName(keyName)
        if (!user) return console.log(`${keyName} does not exist.`);
            
        let {displayName, id: userid} = user;
        console.log(`===${displayName}:${userid}`);
        let prevStream = await apiClient.helix.streams.getStreamByUserName(displayName); 
        if (prevStream) {
            console.log(`======${keyName} is already streaming`);
            console.log(prevStream);
        }
        else console.log(`======${keyName} is not currently streaming`);
    
        const subscription = await listener.subscribeToStreamChanges(userid, async (stream) => {
            
            if (stream) { 
                if (!prevStream) {
                    test.send(`=========${displayName} just started streaming`)
                    console.log((`=========${displayName} just started streaming`));
                }
                else {
                    test.send(`=========${displayName} stream changed`)
                    console.log((`=========${displayName} stream changed`));
                }
            } 
            else { 
                test.send(`=========${displayName} has ended the stream`)
                console.log((`=========${displayName} has ended the stream`));
             }
    
        });
    
        subscription.start().then(() => { 
            console.log(`Subscribed to ${displayName}:${userid}`.grey)
        })

        
process.on("SIGINT", async () => {
    // Kill all twitch subscription listeners beforing ending script. 
    // for (x in streamers) streamers[x].subs ? streamers[x].subs.stop() : null;
    console.log(`Closing Script`);
    subscription.stop().then(() => process.exit())
})




    })
    
})


/* 
                        Console log output


1|Twitch   | ================================= Old script load =================================
1|Twitch   | [Twitch] PJS-Twitch#6375 is now online!
1|Twitch   | ===EmperorSR:77008186
1|Twitch   | ======EmperorSR is already streaming
1|Twitch   | HelixStream {
1|Twitch   |   _data: {
1|Twitch   |     id: '41837819518',
1|Twitch   |     user_id: '77008186',
1|Twitch   |     user_login: 'emperorsr',
1|Twitch   |     user_name: 'EmperorSR',
1|Twitch   |     game_id: '512901',
1|Twitch   |     game_name: 'Code of Ethics',
1|Twitch   |     type: 'live',
1|Twitch   |     title: 'Trying to fix Twitch Webhooks Code [test update 7]',
1|Twitch   |     viewer_count: 2,
1|Twitch   |     started_at: '2021-02-25T20:26:17Z',
1|Twitch   |     language: 'en',
1|Twitch   |     thumbnail_url: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_emperorsr-{width}x{height}.jpg',
1|Twitch   |     tag_ids: [
1|Twitch   |       '6ea6bca4-4712-4ab9-a906-e3336a9d8039',
1|Twitch   |       'a59f1e4e-257b-4bd0-90c7-189c3efbf917'
1|Twitch   |     ]
1|Twitch   |   }
1|Twitch   | }
1|Twitch   | Hooked EmperorSR:77008186


1|Twitch   | ================================= script load =================================
1|Twitch   | [Twitch] PJS-Twitch#6375 is now online!
1|Twitch   | ===EmperorSR:77008186
1|Twitch   | ======EmperorSR is already streaming
1|Twitch   | [HelixStream#41837819518 - please check https://d-fischer.github.io/twitch/reference/classes/HelixStream.html for available properties]
1|Twitch   | Hooked EmperorSR:77008186
*/