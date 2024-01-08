import { CommandInteraction, TextChannel, NewsChannel } from 'discord.js'
import { PrivateChannelID } from '../constants/privateChannel'
import { moderationChannelId } from './createPrivateChannel'

export async function sendLogToPrivateChannel(interaction: CommandInteraction, log: string) {
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
            content: log,
        })
    } catch (error) {
        console.error(error)
        await interaction.followUp({
            content: 'An error occurred while processing the command',
            ephemeral: true,
        })
    }
}