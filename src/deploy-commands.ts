import { REST, Routes } from 'discord.js'
import { configDiscord } from './config/discord/variable'
import { commands } from './moderation'
import { DeployCommandsProps } from './types/DeployCommand';

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST().setToken(configDiscord.DISCORD_TOKEN)

export async function deployCommands({ guildId }: DeployCommandsProps) {
    try {
        console.log('Started refreshing application (/) commands.')

        await rest.put(
            Routes.applicationGuildCommands(configDiscord.DISCORD_CLIENT_ID, guildId),
            {
                body: commandsData,
            }
        )

        console.log('Successfully reloaded application (/) commands.')
    } catch (error) {
        console.error(error)
    }
}