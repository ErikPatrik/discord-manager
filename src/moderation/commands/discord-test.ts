import { CommandInteraction, SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('test')
    .setDescription('Replies with Erik Discord Test')

export async function execute(interaction: CommandInteraction) {
    return interaction.reply({
        content: 'This code was written by Erik Patrik Pittaluga'
    })
}
