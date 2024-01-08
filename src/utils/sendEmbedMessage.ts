import { ColorResolvable, CommandInteraction, EmbedBuilder } from 'discord.js'

export async function sendEmbedMessage(
    color: ColorResolvable,
    description: string,
    interaction: CommandInteraction) {
        const embed = new EmbedBuilder()
        .setColor(color)
        .setDescription(description)
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL()
        })
        .setFooter({ text: `Request by ${interaction.user.tag}`})
        .setTimestamp()

    await interaction.reply({ embeds: [embed], ephemeral: true })
}