import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
    User,
} from 'discord.js'
import { sendEmbedMessage } from '../../utils/sendEmbedMessage'
import { ActionButtons } from '../../enums/ActionButtons'
import { sendLogToPrivateChannel } from '../../utils/sendLogToPrivateChannel'
import { LogCategory } from '../../enums/LogCategory'
import { ColorEmbedMessage } from '../../enums/ColorEmbedMessage'

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
        const target = interaction.options.getUser('target')
        const reasonOption = interaction.options.get('reason')
        const reason = reasonOption?.value?.toString() ?? 'No reason provided'

        if (!target || target.bot || interaction.user.id === target.id) {
            const errorMessage = target ? (target.bot ? 'You cannot ban Bots.' : 'You cannot ban yourself.') : 'Invalid target.'

            return sendEmbedMessage(
                ColorEmbedMessage.WARNING,
                errorMessage,
                interaction
            )
        }

        const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Danger)

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary)

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(cancel, confirm)

        const response = await interaction.reply({
            content: `Are you sure you want to ban ${target.username} for reason: ${reason}?`,
            components: [row],
            ephemeral: true,
        })

        const collectorFilter = (i: any) => i.customId === ActionButtons.Confirm || i.customId === ActionButtons.Cancel
        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 })

                if (confirmation.customId === 'confirm') {
                    await handleBanConfirmation(interaction, target, reason)
                } else if (confirmation.customId === 'cancel') {
                    await confirmation.update({ content: 'Action cancelled', components: [] })
                }
        } catch (e) {
            await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] })
        }
    } catch (error) {
        console.error(error)
        await interaction.followUp({
            content: 'An error occurred while processing the command.',
            ephemeral: true,
        })
    }
}

async function handleBanConfirmation(interaction: CommandInteraction, target: User, reason: string) {
    const confirmBan = await interaction.guild?.members.ban(target, { reason })

    if (confirmBan) {
        await interaction.editReply({ content: `${target.username} has been banned for reason: ${reason}`, components: [] })
        await sendLogToPrivateChannel(
            interaction,
            `User ${target} has been banned by ${interaction.user.tag} for reason: ${reason}`,
            LogCategory.BAN,
            reason,
        )
    }
}