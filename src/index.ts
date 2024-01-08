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
import express from 'express'
import logRoutes from './routes/log.route'
import { config } from 'dotenv'

config()

const app = express()
const PORT = process.env.PORT_SERVER

app.listen(PORT, () => {
    console.log(`Server running on the port ${PORT}`)
})

app.use('/api', logRoutes)

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