import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    SlashCommandBuilder,
} from 'discord.js'
import ms = require('ms')
import { sendEmbedMessage } from '../../utils/sendEmbedMessage'
import { ActionButtons } from '../../enums/ActionButtons'
import { sendLogToPrivateChannel } from '../../utils/sendLogToPrivateChannel'
import { LogCategory } from '../../enums/LogCategory'
import { ColorEmbedMessage } from '../../enums/ColorEmbedMessage'

export const data = new SlashCommandBuilder()
    .setName('temprole')
    .setDescription('Temporary role to user')
    .setDMPermission(false)
    .addUserOption(option => option
        .setName('user')
        .setDescription('Member you wish change the role for a time')
        .setRequired(true)
    )
    .addRoleOption(option => option
        .setName('role')
        .setDescription('The role to add the user')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('timeout')
        .setDescription('Time with role change')
        .setRequired(false)
    )
    .addStringOption(option => option
        .setName('reason')
        .setDescription('Reason for change the role')
        .setRequired(false)
        .setMinLength(1)
        .setMaxLength(255)
    )

export async function execute(interaction: CommandInteraction) {
    try {
        const user = interaction.options.getUser('user')
        const roleOption = interaction.options.get('role')

        if (!user || !roleOption) {
            return
        }

        const roleId = roleOption?.value?.toString() ?? 'No role provided'
        const timeoutOption = interaction.options.get('timeout')
        const timeoutValue = timeoutOption?.value?.toString()
        const msDuration = timeoutValue ? ms(timeoutValue) : 30000
        const reasonOption = interaction.options.get('reason')
        const reason = reasonOption?.value?.toString() ?? 'No reason provided'

        if (user.bot) {
            return sendEmbedMessage(
                ColorEmbedMessage.WARNING,
                'You cannot change the bots role.',
                interaction
            )
        }

        const target = interaction.guild?.members.cache.get(user.id)
        const dataRole = interaction.guild?.roles.cache.get(roleId)

        if (!target || !dataRole || isNaN(msDuration)) {
            return
        }

        const checkSameRole = target.roles.cache.has(roleId)

        if (checkSameRole) {
            return sendEmbedMessage(
                ColorEmbedMessage.WARNING,
                `User ${target} already has the role ${dataRole?.name}`,
                interaction,
            )
        }

        const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Primary)

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary)

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(cancel, confirm)

        const response = await interaction.reply({
            content: `Are you sure you want to add ${target} to the role ${dataRole?.name} for reason: ${reason}?`,
            components: [row],
            ephemeral: true,
        })

        const collectorFilter = (i: any) => i.customId === ActionButtons.Confirm || i.customId === ActionButtons.Cancel

        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 })

            if (confirmation.customId === 'confirm') {
                await handleRoleConfirmation(interaction, target, roleId, dataRole.name, reason, msDuration)
            } else if (confirmation.customId === 'cancel') {
                await confirmation.update({ content: 'Action cancelled', components: [] })
            }

            await interaction.editReply({ components: [] })
        } catch (error) {
            console.error(error)
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

async function handleRoleConfirmation(
    interaction: CommandInteraction,
    target: any,
    roleId: string,
    roleName: string,
    reason: string,
    timeout: number) {
    const descriptionDuration = ms(timeout, { long: true })
    const addRole = await target.roles.add(roleId)

    await interaction.editReply(`
        ${target} has been successfully added to the role ${roleName} for ${descriptionDuration}\nReason: ${reason}
    `)

    if (addRole) {
        await sendLogForTemporaryRoleChange(interaction, target.displayName, roleName, reason, descriptionDuration)
    }

    setTimeout(async () => {
        const removeRole = await target.roles.remove(roleId)
        await interaction.editReply(`
            ${target} has been successfully removed to the role ${roleName}
        `)

        if (removeRole) {
            await sendLogForTemporaryRoleChange(interaction, target.displayName, roleName, reason, descriptionDuration)
        }
    }, timeout)
}

async function sendLogForTemporaryRoleChange(
    interaction: CommandInteraction,
    target: string,
    roleName: string,
    reason: string,
    descriptionDuration: string) {
    await sendLogToPrivateChannel(
        interaction,
        `User ${target} has been successfully added to the role ${roleName}`,
        LogCategory.TEMPORARY_ROLE_CHANGE,
        reason,
        descriptionDuration
    )
}