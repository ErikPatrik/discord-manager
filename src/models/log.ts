import mongoose from 'mongoose'
import { LogCategory } from '../enums/LogCategory'
import { ILog } from '../interfaces/ILog'

const logSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: Object.values(LogCategory),
        required: true
    },
    description: String,
    reason: String,
    duration: String,
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
})

const Log = mongoose.model<ILog>('log', logSchema)

export default Log