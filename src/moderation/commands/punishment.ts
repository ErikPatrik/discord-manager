import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    GuildMember,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from 'discord.js'
import ms = require('ms')
import { sendEmbedMessage } from '../../utils/sendEmbedMessage'
import { ActionButtons } from '../../enums/ActionButtons'
import { sendLogToPrivateChannel } from '../../utils/sendLogToPrivateChannel'
import { LogCategory } from '../../enums/LogCategory'
import { ColorEmbedMessage } from '../../enums/ColorEmbedMessage'

export const data = new SlashCommandBuilder()
    .setName('punishment')
    .setDescription('Punish a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addUserOption(option => option
        .setName('user')
        .setDescription('Member you wish punish for a time')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('duration')
        .setDescription('Punishment time')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('reason')
        .setDescription('Reason for Punish a member')
        .setRequired(false)
        .setMinLength(1)
        .setMaxLength(255)
    )

export async function execute(interaction: CommandInteraction) {
    try {
        const user = interaction.options.getUser('user')

        const durationOption = interaction.options.get('duration')
        const durationValue = durationOption?.value?.toString()
        const msDuration = durationValue ? ms(durationValue) : 10000

        const reasonOption = interaction.options.get('reason')
        const reason = reasonOption?.value?.toString() ?? 'No reason provided'

        if (!user || user.bot || interaction.user.id === user.id) {
            const errorMessage = user ? (user.bot ? 'You cannot punish Bots.' : 'You cannot punish yourself.') : 'Invalid target.'

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

        const member = interaction.guild?.members.cache.get(interaction.user.id)
        const target = interaction.guild?.members.cache.get(user.id)

        if (!member || !target) {
            return
        }

        if (member.roles.highest.position > target.roles.highest.position) {
            return sendEmbedMessage(
                ColorEmbedMessage.WARNING,
                'You cannot punish someone with a higher role than you.',
                interaction
            )
        }

        if (isNaN(msDuration)) {
            return sendEmbedMessage(
                ColorEmbedMessage.WARNING,
                'Please provide a valid timeout duration.',
                interaction
            )
        }

        if (msDuration < 5000 || msDuration > 2.419e9) {
            return sendEmbedMessage(
                ColorEmbedMessage.WARNING,
                'Timeout duration cannot be less than 5 seconds or more than 28 days.',
                interaction
            )
        }

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(cancel, confirm)

        const response = await interaction.reply({
            content: `Are you sure you want to punish ${target} for reason: ${reason}?`,
            components: [row],
            ephemeral: true,
        })

        const collectorFilter = (i: any) => i.customId === ActionButtons.Confirm || i.customId === ActionButtons.Cancel

        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 })

            if (confirmation.customId === 'confirm') {
                await handlePunishmentConfirmation(interaction, target, reason, msDuration)
            } else if (confirmation.customId === 'cancel') {
                await confirmation.update({ content: 'Action cancelled', components: [] })
            }

            await interaction.editReply({ components: [] })
        } catch (error) {
            console.log('Error:', error)
            await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] })
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

async function handlePunishmentConfirmation(
    interaction: CommandInteraction,
    target: GuildMember,
    reason: string,
    msDuration: number) {
    const descriptionDuration = ms(msDuration, { long: true })

    if (target.isCommunicationDisabled()) {
        const updateTimeOut = await target.timeout(msDuration, reason)
        await interaction.editReply(`${target}'s timeout has been updated to ${descriptionDuration}\nReason: ${reason}`)

        if (updateTimeOut) {
            await sendLogForPunishment(interaction, target, reason, descriptionDuration)
        }
    } else {
        const applyTimeOut = await target.timeout(msDuration, reason)
        await interaction.editReply(`${target} was timed out for ${descriptionDuration}.\nReason: ${reason}`)

        if (applyTimeOut) {
            await sendLogForPunishment(interaction, target, reason, descriptionDuration)
        }
    }
}

async function sendLogForPunishment(
    interaction: CommandInteraction,
    target: GuildMember,
    reason: string,
    descriptionDuration:
    string) {
    await sendLogToPrivateChannel(
        interaction,
        `User ${target} has been punished by ${interaction.user.tag} for reason: ${reason}`,
        LogCategory.PUNISHMENT,
        reason,
        descriptionDuration
    )
}