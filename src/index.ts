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

const app = express()
const PORT = 3000

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
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