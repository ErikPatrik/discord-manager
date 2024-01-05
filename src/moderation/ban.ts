import { CommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from "discord.js"

export const data = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addUserOption(option => option
        .setName('member')
        .setDescription('Member you wish to ban')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('reason')
        .setDescription('Reason for ban member')
        .setRequired(false)
        .setMinLength(1)
        .setMaxLength(255)
    )

export async function execute(interaction: CommandInteraction) {
    try {
        await interaction.deferReply({ ephemeral: true })

        const member = await interaction.guild?.members.fetch(interaction.user.id)

        if (!member || !member.permissions.has(PermissionFlagsBits.KickMembers)) {
            await interaction.reply({
                content: 'You are not allowed to kick members.',
                ephemeral: true,
            })
            return
        }

        const userToBan = interaction.options.getUser('member')
        const reasonOption = interaction.options.get('reason')
        const reason = reasonOption?.value?.toString() ?? 'No reason provided.'

        if (interaction.user.id === userToBan?.id) {
            await interaction.editReply(`You can't ban yourself`)
            return
        }

        if (userToBan) {
            await interaction.guild?.members.ban(userToBan.id, { reason })
            await interaction.followUp({
                content: `User ${userToBan.username} has been banned.`,
                ephemeral: true,
            })
        } else {
            await interaction.followUp({
                content: 'User not found.',
                ephemeral: true,
            })
        }
    } catch (error) {
        console.error(error)
        await interaction.followUp({
            content: 'An error occurred while processing the command.',
            ephemeral: true,
        })
    }
}