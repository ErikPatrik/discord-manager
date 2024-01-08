import { CommandInteraction, TextChannel } from "discord.js";
import { PrivateChannelID } from "../constants/privateChannel";

export async function sendLogToPrivateChannel(interaction: CommandInteraction, log: string, ) {
    try {
        const logChannel = await interaction.guild?.channels.fetch(PrivateChannelID) as TextChannel

        if (logChannel) {
            logChannel.send({
                content: log,
            })
        }

    } catch (error) {
        console.error(error)
        await interaction.followUp({
            content: 'An error occurred while processing the command',
            ephemeral: true,
        })
        return
    }
}