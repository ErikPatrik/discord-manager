import { config } from 'dotenv'

config()

const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
    throw new Error("Variables not informed")
}

export const configDiscord = {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
}