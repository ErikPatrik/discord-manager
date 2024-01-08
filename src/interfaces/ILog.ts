import { Document } from "mongoose"
import { LogCategory } from "../enums/LogCategory"

export interface ILog extends Document {
    user: string
    category: LogCategory
    description?: string
    reason?: string
    duration?: string
    timestamp: Date
}