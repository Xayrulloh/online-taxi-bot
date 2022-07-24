import { Scene } from 'grammy-scenes'
import replaceFunction from '#button'
import Data from '#database'
import { Keyboard } from 'grammy'
import axios from 'axios'

let newScene = new Scene('Order')

newScene.do( async(ctx) => {
    if (!(await Data.models.passenger.findOne({ userId: ctx.update.message.from.id }))) {
        ctx.reply("Avval ro'yxatdan o'tishingiz lozim")
        ctx.scene.exit()
    } else {
        const keyboard = new Keyboard().requestLocation('Mening joylashuvim')
        ctx.reply('Joylashuvingizni kiriting!', {reply_markup: { resize_keyboard: true, keyboard: keyboard.build()}})
    }
})

newScene.wait().on('message', async(ctx) => {
    if (ctx.message.location) {
        try {
            let response = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${ctx.message.location.latitude}&lon=${ctx.message.location.longitude}&apiKey=${process.env.APIKEY}`) 
            ctx.session.stayingOn = { mamlakat: response.data.features[0].properties.country, shahar: response.data.features[0].properties.city, tuman: response.data.features[0].properties.county, kocha:response.data.features[0].properties.street, postcode:response.data.features[0].properties.postcode }
            console.log(ctx.session.stayingOn);
            ctx.session.locationOfStaying = ctx.message.location
            ctx.reply('Bormoqchi bo\'lgan joyingizni kartadan jo\'nating!', {reply_markup: { remove_keyboard: true }})
            ctx.scene.resume()
        } catch (error) {
            console.log(error.message);            
        }
    } else {
        const keyboard = new Keyboard().requestLocation('Mening joylashuvim')
        ctx.reply('Joylashuvingizni kiriting!', {reply_markup: { resize_keyboard: true, keyboard: keyboard.build()}})
    }
})

newScene.wait().on('message', async(ctx) => {
    if (ctx.message.location) {
        try {
            let response = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${ctx.message.location.latitude}&lon=${ctx.message.location.longitude}&apiKey=${process.env.APIKEY}`) 
            ctx.session.goingTo = { mamlakat: response.data.features[0].properties.country, shahar: response.data.features[0].properties.city, tuman: response.data.features[0].properties.county, kocha:response.data.features[0].properties.street, postcode:response.data.features[0].properties.postcode }
            ctx.session.locationOfGoing = ctx.message.location
            
            if (ctx.session.stayingOn.kocha == ctx.session.goingTo.kocha) {
                ctx.reply('Bormoqchi bo\'lgan joyingizni kartadan jo\'nating!')
            } else {
            ctx.reply('Beradigan pul miqdoringizni kiriting')
            ctx.scene.resume()
            }
        } catch (error) {
            console.log(error.message);            
        }
    } else {
        ctx.reply('Bormoqchi bo\'lgan joyingizni kartadan jo\'nating!')
    }
})

newScene.wait().on('message:text', async(ctx) => {
    if (!(isNaN(+ctx.message.text.replace(/\s/g, '')))) {
        ctx.session.money = ctx.message.text.split('').reverse().join('').replace(/[^\dA-Z]/g, '').replace(/(.{3})/g, '$1 ').split('').reverse().join('') + ' sum'
        let buttons = replaceFunction('Ha', 'Yo\'q')
        console.log(ctx.session.stayingOn);
        ctx.reply(`Ushbu malumotlarni tasdiqlaysizmi?\nJoylashuvingiz\nDavlat: ${ctx.session.stayingOn.mamlakat}\nShahar: ${ctx.session.stayingOn.shahar}\nTuman: ${ctx.session.stayingOn.tuman.split(' ')[0]}\nKo'cha: ${ctx.session.stayingOn.kocha}\n\nBoradigan joyingiz\nDavlat: ${ctx.session.goingTo.mamlakat}\nShahar: ${ctx.session.goingTo.shahar}\nTuman: ${ctx.session.goingTo.tuman.split(' ')[0]}\nKo'cha: ${ctx.session.goingTo.kocha}\n\nPul miqdori: ${ctx.session.money}`, {reply_markup: {keyboard: buttons.build(), resize_keyboard: true }})
        ctx.scene.resume()
    } else {
        ctx.reply('Beradigan pul miqdoringizni kiriting')
    }
})

newScene.wait().on('message:text', async(ctx) => {
    if (ctx.message.text == 'Ha') {
        await Data.models.connector.create({ passengerId: ctx.update.message.from.id, started: false, staying: ctx.session.stayingOn, stayingLongLat: ctx.session.locationOfStaying, going: ctx.session.goingTo, goingLongLat: ctx.session.locationOfGoing, money: ctx.session.money, arrivedByDriver: false, arrivedByPassenger: false })
        ctx.reply('Ma\'lumot barcha haydovchilarga yetkazildi\nIltimos kuting.', {reply_markup: { remove_keyboard: true }})
        socket(ctx, ctx.update.message.from.id)
        ctx.scene.resume()
        
    } else if (ctx.message.text == 'Yo\'q') {
        ctx.reply('Barchasi bekor qilindi', {reply_markup: { remove_keyboard: true }})
        ctx.scene.exit()
    } else {
        let buttons = replaceFunction('Ha', 'Yo\'q')
        ctx.reply(`Ushbu malumotlarni tasdiqlaysizmi?\nJoylashuvingiz\nDavlat: ${ctx.session.stayingOn.mamlakat}\nShahar: ${ctx.session.stayingOn.shahar}\nTuman: ${ctx.session.stayingOn.tuman.split(' ')[0]}\nKo'cha: ${ctx.session.stayingOn.kocha}\n\nBoradigan joyingiz\nDavlat: ${ctx.session.goingTo.mamlakat}\nShahar: ${ctx.session.goingTo.shahar}\nTuman: ${ctx.session.goingTo.tuman.split(' ')[0]}\nKo'cha: ${ctx.session.goingTo.kocha}\n\nPul miqdori: ${ctx.session.money}`, {reply_markup: {keyboard: buttons.build(), resize_keyboard: true }})
    }
})

newScene.wait().on('message:text', async(ctx) => {
    if (ctx.message.text == 'Yetib keldim') {
        await Data.models.connector.findOneAndUpdate({ passengerId: ctx.update.message.from.id }, {arrivedByPassenger: true})
        ctx.reply('Yaxshi yetib olganingizdan xursandmiz 😊', {reply_markup: { remove_keyboard: true }})
        ctx.scene.exit()
    } else {
        ctx.reply('Iltimos kuting!')
    }
})

export default newScene

async function socket(ctx, passengerId) {
    let interval = setInterval(async() => {
        let data = await Data.models.connector.findOne({ passengerId })
        if (data.started) {
            let buttons = replaceFunction('Yetib keldim')
            let driverInfo = await Data.models.driver.findOne({ userId: data.driverId })
            ctx.reply(`Haydovchi yo\'lga chiqdi. Iltimos kuting.\nHaydovchining malumotlari\nIsmi: ${driverInfo.userName}\nTelefon raqami: ${driverInfo.phone}\nMashinasi: ${driverInfo.car} ${driverInfo.colorOfCar}\nMashina raqami: ${driverInfo.carNumber}\nYetib borganizdan so\'ng "Yetib keldim" knopkasini bosishni unutmang`, {reply_markup: { resize_keyboard: true, keyboard: buttons.build()}})
            clearInterval(interval)
        }
    }, 5000);
}