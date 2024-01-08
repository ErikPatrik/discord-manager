import { config } from 'dotenv'

config()

const { MONGO_USER, MONGO_PASS, MONGO_URI } = process.env

if (!MONGO_USER || !MONGO_PASS || !MONGO_URI) {
    throw new Error("Variables not informed")
}

export const configDatabase = {
    MONGO_USER,
    MONGO_PASS,
    MONGO_URI
}