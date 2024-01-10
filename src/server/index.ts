import 'dotenv/config'
import {
    Client,
    GatewayIntentBits,
} from 'discord.js'
import { configDiscord } from '../config/discord/variable'
import ready from '../listeners/ready'
import db from '../config/database/database'
import { guildCreate } from '../listeners/guildCreate'
import { interactionCreate } from '../listeners/interactionCreate'
import express from 'express'
import cors from 'cors'
import logRoutes from '../routes/log.route'
import { config } from 'dotenv'

config()

const app = express()
const PORT = process.env.PORT_SERVER

const corsOptions = {
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    credentials: true,
}

app.use(cors(corsOptions))

app.get('/', (req, res) => {
    const discordProject = {
        name: 'My Discord Project',
        description: 'An amazing bot for managing Discord servers.',
        author: 'Erik',
        version: '1.0.0',
        repository: 'https://github.com/ErikPatrik/discord-manager',
    }

    res.json(discordProject)
})

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