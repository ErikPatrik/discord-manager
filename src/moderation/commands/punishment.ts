import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from 'discord.js'
import ms = require('ms')

enum ButtonId {
    Confirm = 'confirm',
    Cancel = 'cancel',
}

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
        .setName('timeout')
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
            .setLabel('Confirm Punishment')
            .setStyle(ButtonStyle.Danger)

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary)

        const user = interaction.options.getUser('user')

        const timeoutOption = interaction.options.get('timeout')
        const timeoutValue = timeoutOption?.value?.toString()
        const msDuration = timeoutValue ? ms(timeoutValue) : 10000

        const reasonOption = interaction.options.get('reason')
        const reason = reasonOption?.value?.toString() ?? 'No reason provided'

        if (user) {
            if (user.bot) {
                return interaction.reply({
                    content: `You can't punish Bots.`,
                    ephemeral: true,
                })
            }

            const member = interaction.guild?.members.cache.get(interaction.user.id)
            const target = interaction.guild?.members.cache.get(user.id)

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(cancel, confirm)

            if (member && target) {
                if (member.roles.highest.position > target.roles.highest.position) {
                    return interaction.reply({
                        content: `You cannot punish someone with a higher role than you.`,
                        ephemeral: true,
                    })
                }

                if (isNaN(msDuration)) {
                    return interaction.reply({
                        content: 'Please provide a valid timeout duration.',
                        ephemeral: true,
                    })
                }

                if (msDuration < 5000 || msDuration > 2.419e9) {
                    return interaction.reply({
                        content: 'Timeout duration cannot be less than 5 seconds or more than 28 days.',
                        ephemeral: true,
                    })
                }

                const response = await interaction.reply({
                    content: `Are you sure you want to punish ${target} for reason: ${reason}?`,
                    components: [row],
                    ephemeral: true,
                })

                const collectorFilter = (i: any) => i.customId === ButtonId.Confirm || i.customId === ButtonId.Cancel

                try {
                    const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 })

                    if (confirmation.customId === 'confirm') {
                        if (target.isCommunicationDisabled()) {
                            await target.timeout(msDuration, reason)
                            await interaction.editReply(`${target}'s timeout has been updated to ${ms(msDuration, { long: true })}\nReason: ${reason}`)
                        } else {
                            await target.timeout(msDuration, reason)
                            await interaction.editReply(`${target} was timed out for ${ms(msDuration, { long: true })}.\nReason: ${reason}`)
                        }
                    }  else if (confirmation.customId === 'cancel') {
                        await confirmation.update({ content: 'Action cancelled', components: [] })
                    }

                    await interaction.editReply({ components: [] })
                } catch (error) {
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