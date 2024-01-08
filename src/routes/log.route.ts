import express, { Request, Response } from 'express'
import { Document } from 'mongoose'
import { ILog } from '../interfaces/ILog'
import Log from '../models/log'

const logRoutes = express.Router()

logRoutes.get('/logs', async (req: Request, res: Response) => {
    try {
        const logs: Document<ILog>[] = await Log.find()
        res.json(logs)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error to get Discord logs.' })
    }
})

export default logRoutes