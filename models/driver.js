import mongoose from 'mongoose'

const driver = new mongoose.Schema({
    userId: Number,
    userName: String,
    phone: { type: String, minlength: 13, maxlength: 17 },
    history: String,
    car: { type: String, enum: ['Tico', 'Nexia 1', 'Nexia 2', 'Nexia 3', 'Matiz', 'Spark', 'Jiguli', 'Gentra', 'Lacetti', 'Cobalt', 'Malibu 1', 'Malibu 2', 'Captiva', 'Tracker 1', 'Tracker 2', 'Inomarka'] },
    carNumber: { type: String, minlength: 8, maxlength: 8},
    colorOfCar: { type: String, enum: ['Qora', 'Qizil', 'Ko\'k', 'Qora', 'Oq', 'Yashil', 'Sariq', 'Kulrang', 'Olo\'vrang', 'Siyohrang'] },
})

export default mongoose.model('Driver', driver)