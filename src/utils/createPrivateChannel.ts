import { ChannelType, Client, PermissionsBitField } from 'discord.js'

let moderationChannelId

export async function createPrivateChannel(guild, client: Client) {
    try {
        const existingChannel = guild.channels.cache.find(channel => channel.name === 'moderation')

        if (existingChannel) {
            console.log('Channel moderation already exists')
            moderationChannelId = existingChannel.id
            return
        }

        const channel = await guild.channels.create({
            name: 'moderation',
            type: ChannelType.GuildText,
            permissionOverwrites:
            [
                {
                    id: guild.roles.everyone,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: client?.user?.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                },
            ],
        })

        moderationChannelId = channel.id

        console.log(`Private channel created: ${channel.name} with ID: ${moderationChannelId}`)
    } catch (error) {
        console.error('Error to create private channel:', error)
    }
}

export { moderationChannelId }