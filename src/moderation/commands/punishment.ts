import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from 'discord.js'
import ms = require('ms')
import { sendEmbedMessage } from '../../utils/sendEmbedMessage'
import { ActionButtons } from '../../enums/ActionButtons'
import { sendLogToPrivateChannel } from '../../utils/sendLogToPrivateChannel'

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
        const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Danger)

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary)

        const user = interaction.options.getUser('user')

        const durationOption = interaction.options.get('duration')
        const durationValue = durationOption?.value?.toString()
        const msDuration = durationValue ? ms(durationValue) : 10000

        const reasonOption = interaction.options.get('reason')
        const reason = reasonOption?.value?.toString() ?? 'No reason provided'

        if (user) {
            if (user.bot) {
                return sendEmbedMessage(
                    '#ff0000',
                    'You cannot punish Bots.',
                    interaction
                )
            }

            const member = interaction.guild?.members.cache.get(interaction.user.id)
            const target = interaction.guild?.members.cache.get(user.id)

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(cancel, confirm)

            if (member && target) {
                if (member.roles.highest.position > target.roles.highest.position) {
                    return sendEmbedMessage(
                        '#ff0000',
                        'You cannot punish someone with a higher role than you.',
                        interaction
                    )
                }

                if (isNaN(msDuration)) {
                    return sendEmbedMessage(
                        '#ff0000',
                        'Please provide a valid timeout duration.',
                        interaction
                    )
                }

                if (msDuration < 5000 || msDuration > 2.419e9) {
                    return sendEmbedMessage(
                        '#ff0000',
                        'Timeout duration cannot be less than 5 seconds or more than 28 days.',
                        interaction
                    )
                }

                const response = await interaction.reply({
                    content: `Are you sure you want to punish ${target} for reason: ${reason}?`,
                    components: [row],
                    ephemeral: true,
                })

                const collectorFilter = (i: any) => i.customId === ActionButtons.Confirm || i.customId === ActionButtons.Cancel

                try {
                    const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 })

                    if (confirmation.customId === 'confirm') {
                        if (target.isCommunicationDisabled()) {
                            await target.timeout(msDuration, reason)
                            await interaction.editReply(`${target}'s timeout has been updated to ${ms(msDuration, { long: true })}\nReason: ${reason}`)
                        } else {
                            await target.timeout(msDuration, reason)

                            await sendLogToPrivateChannel(
                                interaction,
                                `User ${target} has been punished by ${interaction.user.tag} for reason: ${reason}`
                            )

                            await interaction.editReply(`${target} was timed out for ${ms(msDuration, { long: true })}.\nReason: ${reason}`)
                        }
                    }  else if (confirmation.customId === 'cancel') {
                        await confirmation.update({ content: 'Action cancelled', components: [] })
                    }

                    await interaction.editReply({ components: [] })
                } catch (error) {
                    console.log('aqui', error)
                    await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] })
                }
            }
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