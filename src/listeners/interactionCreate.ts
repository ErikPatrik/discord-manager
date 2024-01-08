import { Client } from "discord.js"
import { commands } from "../moderation"

export async function interactionCreate(client: Client)  {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) {
            return
        }

        const { commandName } = interaction

        try {
            if (commands[commandName as keyof typeof commands]) {
                await commands[commandName as keyof typeof commands].execute(interaction)
            }
        } catch (error) {
            console.error(`Error executing command: ${error}`)
            await interaction.reply({ content: 'An error occurred while executing the command.', ephemeral: true })
        }
    })
}