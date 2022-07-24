import { Scene } from 'grammy-scenes'
import replaceFunction from '#button'
import Data from '#database'
import { Keyboard } from 'grammy'
import axios from 'axios'

let newScene = new Scene('Client'), passengers = [], passengerId;

newScene.do( async(ctx) => {
    if (!(await Data.models.driver.findOne({ userId: ctx.update.message.from.id }))) {
        ctx.reply("Avval ro'yxatdan o'tishingiz lozim")
        ctx.scene.exit()
    } else {
        const keyboard = new Keyboard().requestLocation('Mening joylashuvim')
        ctx.reply('Sizga yaqin bo\'lgan yo\'lovchilarni topish uchun joylashuvingizni jo\'nating!', {reply_markup: { resize_keyboard: true, keyboard: keyboard.build()}})
    }
})

newScene.wait().on('message', async(ctx) => {
    if (ctx.message.location) {
        try {
            let response = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${ctx.message.location.latitude}&lon=${ctx.message.location.longitude}&apiKey=${process.env.APIKEY}`) 
            passengers = await Data.models.connector.find({ "staying.postcode": response.data.features[0].properties.postcode, started: false }).limit(10)
            if (!passengers.length) {
                passengers = await Data.models.connector.find({ "staying.tuman": response.data.features[0].properties.county, started: false }).limit(10)
            }
            if (passengers.length) {
                let result = passengersButton(passengers)
                ctx.reply('Quyidagi yo\'lovchilardan birini tanlang!\nYodingizda bo\'lsin tanlaganingizdan so\'ng sizda bekor qilish imkoni mavjud emas!\n\n' + result[1], {reply_markup: {keyboard: result[0].build(), resize_keyboard: true }})
                ctx.scene.resume()
            } else {
                ctx.reply('Afsuski yo\'lovchi topilmadi\nBirozdan so\'ng yana urinib ko\'ring', {reply_markup: {remove_keyboard: true}})
                ctx.scene.exit()
            }
        } catch (error) {
            console.log(error.message);            
        }
    } else {
        const keyboard = new Keyboard().requestLocation('Mening joylashuvim')
        ctx.reply('Sizga yaqin bo\'lgan yo\'lovchilarni topish uchun joylashuvingizni jo\'nating!', {reply_markup: { resize_keyboard: true, keyboard: keyboard.build()}})
    }
})

newScene.wait().on('message:text', async(ctx) => {
    if (!(isNaN(+ctx.message.text.replace(/\s/g, ''))) && passengers[+ctx.message.text - 1]) {
        let connector = passengers[+ctx.message.text - 1];
        passengerId = connector.passengerId
        await Data.models.connector.findOneAndUpdate({passengerId: connector.passengerId}, {started: true, driverId: ctx.update.message.from.id})
        let passenger = await Data.models.passenger.findOne({userId: connector.passengerId}), buttons = replaceFunction('Yetib keldik')

        await ctx.reply(`Yo'lovchining ismi: ${passenger.userName}\nYo'lovchining telefon raqami: ${passenger.phone}`)
        await ctx.reply(`Joylashuv 👇👇👇👇`)
        await ctx.replyWithLocation(connector.stayingLongLat.latitude, connector.stayingLongLat.longitude)
        await ctx.reply(`Boriladigan joy 👇👇👇👇`)
        await ctx.replyWithLocation(connector.goingLongLat.latitude, connector.goingLongLat.longitude)
        await ctx.reply(`Yetib borganda "Yetib keldik" knopkasini bosishni unutmang`, {reply_markup: { resize_keyboard: true, keyboard: buttons.build()}})
        ctx.scene.resume()

    } else {
        let result = passengersButton(passengers)
        ctx.reply('Quyidagi yo\'lovchilardan birini tanlang!\nYodingizda bo\'lsin tanlaganingizdan so\'ng sizda bekor qilish imkoni mavjud emas!\n\n' + result[1], {reply_markup: {keyboard: result[0].build(), resize_keyboard: true }})
    }
})

newScene.wait().on('message:text', async(ctx) => {
    if (ctx.message.text == 'Yetib keldik') {
        let answer = await Data.models.connector.findOne({passengerId})
        if (answer.arrivedByPassenger) {
            ctx.reply('Eson omon yetkazib qoyganingiz uchun tashakkur. Oq yo\'l', {reply_markup: {remove_keyboard: true}})
            await Data.models.connector.deleteOne({passengerId})
            let data = await Data.models.history.findOneAndUpdate({userId: ctx.update.message.from.id}, { $inc: { money: +answer.money.replace(/\D/g, ''), client: 1 }})
            if (!data) {
                await Data.models.history.create({userId: ctx.update.message.from.id, money: answer.money.replace(/\D/g, ''), client: 1})
            }
            ctx.scene.exit()
        } else {
            ctx.reply('Agarda yetib kelgan bo\'lsangiz avval yo\'lovchi tasdiqlashi kerak!')
        }
    } else {
        let buttons = replaceFunction('Yetib keldik');
        ctx.reply(`Yetib borganda "Yetib keldik" knopkasini bosishni unutmang`, {reply_markup: { resize_keyboard: true, keyboard: buttons.build()}})
    }
})

export default newScene

function passengersButton(arr) {
    let text = ''
    const inlineKeyboard = new Keyboard()
    arr.forEach((el, index) => {   
        text += `${index + 1}) Joylashuv\nDavlat: ${el.staying.mamlakat}\nShahar: ${el.staying.shahar}\nTuman: ${el.staying.tuman}\nKo'cha: ${el.staying.kocha}\n\nBoriladigan joy\nDavlat: ${el.going.mamlakat}\nShahar: ${el.going.shahar}\nTuman: ${el.going.tuman}\nKo'cha: ${el.going.kocha}\n\nPul miqdori: ${el.money}\n---------------------------------------------\n` 
        if (index % 5 == 0) {
            inlineKeyboard.row()
        }
        inlineKeyboard.text(index + 1)
    })
    return [inlineKeyboard, text]
}