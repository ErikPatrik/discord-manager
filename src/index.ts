import 'dotenv/config'
import {
    Client,
    GatewayIntentBits,
} from 'discord.js'
import { configDiscord } from './config/discord'
import { commands } from './moderation'
import { deployCommands } from './deploy-commands'
import ready from './listeners/ready'
import { createPrivateChannel } from './utils/createPrivateChannel'
import db from './config/database/database'

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

client.on('guildCreate', async (guild) => {
    await deployCommands({ guildId: guild.id })

    await createPrivateChannel(guild, client)
})

ready(client)

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return
    }

    const { commandName } = interaction

    try {
        if (commands[commandName as keyof typeof commands]) {
            await commands[commandName as keyof typeof commands].execute(interaction)
        }
    } catch (error) {
        console.error(`Error executing command: ${error}`)
        await interaction.reply({ content: 'An error occurred while executing the command.', ephemeral: true })
    }
})

client.login(configDiscord.DISCORD_TOKEN)