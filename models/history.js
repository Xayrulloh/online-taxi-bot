import mongoose from 'mongoose'

const history = new mongoose.Schema({
    userId: Number,
    money: Number,
    client: Number
})

export default mongoose.model('History', history)