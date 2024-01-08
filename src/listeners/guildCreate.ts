import { Client } from "discord.js"
import { deployCommands } from "../deploy-commands"
import { createPrivateChannel } from "../utils/createPrivateChannel"

export async function guildCreate(client: Client)  {
    client.on('guildCreate', async (guild) => {
        await deployCommands({ guildId: guild.id })

        await createPrivateChannel(guild, client)
    })
}