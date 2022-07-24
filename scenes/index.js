import { ScenesComposer } from "grammy-scenes"
import start from "./start.js"
import reRegister from "./re-register.js"
import order from './order.js'
import client from './client.js'
import history from './history.js'

export const scenes = new ScenesComposer(start, reRegister, order, client, history)