import mongoose from 'mongoose'

const connector = new mongoose.Schema({
    passengerId: Number,
    driverId: Number,
    started: Boolean,
    staying: Object,
    stayingLongLat: Object,
    goingLongLat: Object,
    going: Object,
    money: String,
    arrivedByDriver: Boolean,
    arrivedByPassenger: Boolean
})

export default mongoose.model('Connector', connector)