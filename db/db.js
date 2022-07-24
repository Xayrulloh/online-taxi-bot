import mongoose from 'mongoose'

connect()

import models from '#models'

async function connect() {
    await mongoose.connect('mongodb://localhost:27017/Taxi')
}

export default {
    models
}