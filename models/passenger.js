import mongoose from 'mongoose'

const Passenger = new mongoose.Schema({
    userId: Number,
    userName: String,
    phone: { type: String }
})

export default mongoose.model('Passenger', Passenger)