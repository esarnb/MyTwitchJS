require("dotenv").config();
require("colors");

const {Client, MessageEmbed, WebhookClient} = require("discord.js");
const { ApiClient } = require('twitch');
const { WebHookListener, SimpleAdapter } = require('twitch-webhooks');
const { ClientCredentialsAuthProvider } = require("twitch-auth");
const {twitchClientID, twitchClientSecret} = process.env;

const client = new Client();
const authProvider = new ClientCredentialsAuthProvider(twitchClientID, twitchClientSecret);
const apiClient = new ApiClient({ authProvider });
const listener = new WebHookListener(apiClient, new SimpleAdapter({ hostName: process.env.TwitchIP, listenerPort: process.env.TwitchPort }));

let dayjs = require("dayjs");
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const relativeTime = require('dayjs/plugin/relativeTime')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)

/* x Test */ let test = new WebhookClient(process.env.testHookID, process.env.testHookToken);

let subscriptions = new Map();
let streamers = new Map();
streamers.set("EmperorSR", { hooks: [test], subscription: null, user: null })
client.login(process.env.TOKEN)


client.on("ready", async () => {
    console.log(`[Twitch] ${client.user.tag} is now online!`.green);
    await listener.listen();
    console.log(`Twitch client online on port ${process.env.TwitchPort}, Loading Streamers. . .`.green);
    
    for (let [keyName, data] of streamers) {
        let { hooks } = data;
        let user = await apiClient.helix.users.getUserByName(keyName)
        if (user) {
            // let {broadcasterType, description, displayName, id, name, offlinePlaceholderUrl, profilePictureUrl, type, views} = user;
            let {displayName, id, offlinePlaceholderUrl, profilePictureUrl} = user;
            let userid = id, currentTime = dayjs(), category;

            console.log(`Loading Streamer ${displayName}...`.yellow);

            let prevStream = await user.getStream(), embed = new MessageEmbed();
            if (prevStream) console.log(`${displayName} already streaming.`.cyan);
            
            const subscription = await listener.subscribeToStreamChanges(userid, async (stream) => {
                if (stream) {

                    let { userDisplayName} = stream;
                    if (!prevStream) {
                        embed.setTitle(`${userDisplayName} is streaming!`);
                        console.log('ONLINE'.red);
                    } else console.log('CHANGE'.red);
                } 
                
                else {
                    embed.setTitle(`${displayName} is now offline.`)
                    console.log('OFFLINE'.red);
                }
                
                hooks.every(hook => hook.send({embeds: [embed]}))
            });
            subscription.start().then(() => {
                subscriptions.set(keyName, subscription);
                console.log(`Hooked ${displayName}:${id}`.grey);
            })
        }
    }
})

process.on("SIGINT", async () => {
    // Kill all twitch subscription listeners beforing ending script. 
    await subscriptions.forEach((val, key) => {if (val) val.stop()})
    process.exit()
})
