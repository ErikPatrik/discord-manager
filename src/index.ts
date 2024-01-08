import 'dotenv/config'
import {
    Client,
    GatewayIntentBits,
} from 'discord.js'
import { configDiscord } from './config/discord'
import ready from './listeners/ready'
import db from './config/database/database'
import { guildCreate } from './listeners/guildCreate'
import { interactionCreate } from './listeners/interactionCreate'

db()
console.log('Bot GamerSafer starting...')

const client = new Client({
    intents: [
        'Guilds',
        'GuildMessages',
        'GuildMembers',
        'MessageContent',
        'DirectMessages',
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
})

guildCreate(client)
interactionCreate(client)
ready(client)
client.login(configDiscord.DISCORD_TOKEN)