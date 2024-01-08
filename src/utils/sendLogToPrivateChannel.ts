import { CommandInteraction, TextChannel, NewsChannel } from 'discord.js'
import { PrivateChannelID } from '../constants/privateChannel'
import { moderationChannelId } from './createPrivateChannel'
import Log from '../models/log'
import { ILog } from '../interfaces/ILog'
import { LogCategory } from '../enums/LogCategory'

export async function sendLogToPrivateChannel(interaction: CommandInteraction, description: string, category: LogCategory) {
    try {
        const channelId = moderationChannelId || PrivateChannelID

        if (!channelId) {
            console.error('Channel ID is not available.')
            return
        }

        const logChannel = interaction.guild?.channels.resolve(channelId)

        if (!logChannel || !(logChannel instanceof TextChannel || logChannel instanceof NewsChannel)) {
            console.error('Invalid channel type or channel not found.')
            return
        }

        logChannel.send({
            content: description,
        })

        await saveLogDatabase(interaction, category, description)
    } catch (error) {
        console.error(error)
        await interaction.followUp({
            content: 'An error occurred while processing the command',
            ephemeral: true,
        })
    }
}

async function saveLogDatabase(
    interaction: CommandInteraction,
    category: LogCategory,
    description: string) {
    try {
        const newLog: ILog = new Log({
            user: interaction.user.tag,
            category,
            description
        })

        await newLog.save()
    } catch (error) {
        console.error('Error to save log in Database:', error)
    }
}