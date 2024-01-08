import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from 'discord.js'
import { sendEmbedMessage } from '../../utils/sendEmbedMessage'
import { ActionButtons } from '../../enums/ActionButtons'

export const data = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addUserOption(option => option
        .setName('target')
        .setDescription('Member you wish to Ban')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('reason')
        .setDescription('Reason for Ban member')
        .setRequired(false)
        .setMinLength(1)
        .setMaxLength(255)
    )

export async function execute(interaction: CommandInteraction) {
    try {
        const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Danger)

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary)

        const target = interaction.options.getUser('target')
        const reasonOption = interaction.options.get('reason')
        const reason = reasonOption?.value?.toString() ?? 'No reason provided'

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(cancel, confirm)

        if (target) {
            if (target.bot) {
                return sendEmbedMessage(
                    '#ff0000',
                    'You cannot ban Bots.',
                    interaction
                )
            }

            if (interaction.user.id === target.id) {
                return sendEmbedMessage(
                    '#ff0000',
                    'You cannot ban yourself.',
                    interaction
                )
            }

            const response = await interaction.reply({
                content: `Are you sure you want to ban ${target.username} for reason: ${reason}?`,
                components: [row],
                ephemeral: true,
            })

            const collectorFilter = (i: any) => i.customId === ActionButtons.Confirm || i.customId === ActionButtons.Cancel
            try {
                const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 })

                    if (confirmation.customId === 'confirm') {
                        await interaction.guild?.members.ban(target, { reason })
                        await confirmation.update({ content: `${target.username} has been banned for reason: ${reason}`, components: [] })
                    } else if (confirmation.customId === 'cancel') {
                        await confirmation.update({ content: 'Action cancelled', components: [] })
                    }

            } catch (e) {
                await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] })
            }
        }
    } catch (error) {
        console.error(error)
        await interaction.followUp({
            content: 'An error occurred while processing the command.',
            ephemeral: true,
        })
    }
}