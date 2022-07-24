import { Scene } from 'grammy-scenes'
import replaceFunction from '#button'
import Data from '#database'
import { Keyboard } from 'grammy'

let newScene = new Scene('Start'), buttons = replaceFunction('Yo\'lovchi', 'Haydovchi')

newScene.do( async(ctx) => {
    ctx.reply('Iltimos ismingizni kiriting!')
})

newScene.wait().on('message:text', async(ctx) => {
    if (ctx.message.text.trim() && ctx.message.text.split(' ').length == 1) {
        ctx.session.userName = ctx.message.text.trim()
        const keyboard = new Keyboard().requestContact('Mening telefon raqamim')
        ctx.reply('Iltimos telefon raqamingizni quyidagi formatda kiriting!\n +998 90 000 00 00', {reply_markup: { resize_keyboard: true, keyboard: keyboard.build()}})
        
        ctx.scene.resume()
    } else {
        ctx.reply('Iltimos ismingizni kiriting')
    }
})

newScene.wait().on('message', async(ctx) => {
    if (/^[+]998([012345789][012345789]|6[125679]|7[01234569])[0-9]{7}$/.test(ctx.message?.contact?.phone_number?.replace(/\s/g, ''))) {
        ctx.session.phone = ctx.message.contact.phone_number

        ctx.reply('Siz yo\'lovchimisiz yoki haydovchi?', {reply_markup: {keyboard: buttons.build(), resize_keyboard: true }})
        ctx.scene.resume()
    } else if (/^[+]998([012345789][012345789]|6[125679]|7[01234569])[0-9]{7}$/.test(ctx.update.message?.text?.replace(/\s/g, ''))) {
        ctx.session.phone = ctx.message.text

        ctx.reply('Siz yo\'lovchimisiz yoki haydovchi?', {reply_markup: {keyboard: buttons.build(), resize_keyboard: true }})
        ctx.scene.resume()
    }
    else {
        const keyboard = new Keyboard().requestContact('Mening telefon raqamim')
        ctx.reply('Iltimos telefon raqamingizni quyidagi formatda kiriting!\n +998 90 000 00 00', {reply_markup: { resize_keyboard: true, keyboard: keyboard.build()}})
    }
})

newScene.wait().on('message:text', async(ctx) => {
    if ('Yo\'lovchi' == ctx.message.text ) {
        if (await Data.models.passenger.findOne({ userId: ctx.update.message.from.id })) {
            ctx.reply("Siz ro'yxatdan o'tgansiz", { reply_markup: {remove_keyboard:true}})
            ctx.scene.exit()
        } else {
            ctx.reply('Siz ro\'yxatdan muvofaqqiyatli ravishda o\'tidingiz!', { reply_markup: {remove_keyboard:true}})
            await Data.models.passenger.create({ userId: ctx.update.message.from.id, userName: ctx.session.userName, phone: ctx.session.phone, history: '' })
            
            ctx.scene.exit()
        }
    } else if ('Haydovchi' == ctx.message.text) {
        if (await Data.models.driver.findOne({ userId: ctx.update.message.from.id })) {
            ctx.reply("Siz ro'yxatdan o'tgansiz")
            ctx.scene.exit()
        } else {
            let buttons = replaceFunction('Tico', 'Nexia 1', 'Nexia 2', 'Nexia 3', 'Matiz', 'Spark', 'Jiguli', 'Gentra', 'Lacetti', 'Cobalt', 'Malibu 1', 'Malibu 2', 'Captiva', 'Tracker 1', 'Tracker 2', 'Inomarka')
            ctx.reply('Mashinangiz rusumini kiriting', {reply_markup: {keyboard: buttons.build(), resize_keyboard: true }})
            ctx.scene.resume()
        }
    } else {
        ctx.reply('Siz yo\'lovchimisiz yoki haydovchi?', {reply_markup: {keyboard: buttons.build(), resize_keyboard: true }})
    }
})

newScene.wait().on('message:text', async(ctx) => {
    if (['Tico', 'Nexia 1', 'Nexia 2', 'Nexia 3', 'Matiz', 'Spark', 'Jiguli', 'Gentra', 'Lacetti', 'Cobalt', 'Malibu 1', 'Malibu 2', 'Captiva', 'Tracker 1', 'Tracker 2', 'Inomarka'].includes(ctx.message.text)) {
        let buttons = replaceFunction('Qora', 'Qizil', 'Ko\'k', 'Qora', 'Oq', 'Yashil', 'Sariq', 'Kulrang', 'Olo\'vrang', 'Siyohrang')
        ctx.reply('Mashinangiz rangini kiriting', {reply_markup: {keyboard: buttons.build(), resize_keyboard: true }})
        ctx.session.car = ctx.message.text
        ctx.scene.resume()
    } else {
        let buttons = replaceFunction('Tico', 'Nexia 1', 'Nexia 2', 'Nexia 3', 'Matiz', 'Spark', 'Jiguli', 'Gentra', 'Lacetti', 'Cobalt', 'Malibu 1', 'Malibu 2', 'Captiva', 'Tracker 1', 'Tracker 2', 'Inomarka')
        ctx.reply('Mashinangiz rusumini kiriting', {reply_markup: {keyboard: buttons.build(), resize_keyboard: true }})    
    }
})

newScene.wait().on('message:text', async(ctx) => {
    if (['Qora', 'Qizil', 'Ko\'k', 'Qora', 'Oq', 'Yashil', 'Sariq', 'Kulrang', 'Olo\'vrang', 'Siyohrang'].includes(ctx.message.text)) {
        ctx.reply('Mashinangiz raqamini quyidagi formatda kiriting!\n 01A111AA', {reply_markup: { remove_keyboard: true }})
        ctx.session.color = ctx.message.text
        ctx.scene.resume()
    } else {
        let buttons = replaceFunction('Qora', 'Qizil', 'Ko\'k', 'Qora', 'Oq', 'Yashil', 'Sariq', 'Kulrang', 'Olo\'vrang', 'Siyohrang')
        ctx.reply('Mashinangiz rusumini kiriting', {reply_markup: {keyboard: buttons.build(), resize_keyboard: true }})    
    }
})

newScene.wait().on('message:text', async(ctx) => {
    if (/^(01|10|20|30|40|50|60|70|75|80|85|90|95)[a-zA-Z]{1}(\d{3})\w{2}$/.test(ctx.message.text.replace(/\s/g, ''))) {
        ctx.reply('Siz ro\'yxatdan muvofaqqiyatli ravishda o\'tidingiz!', { reply_markup: {remove_keyboard:true}})
        await Data.models.driver.create({ userId: ctx.update.message.from.id, userName: ctx.session.userName, phone: ctx.session.phone, history: '', car: ctx.session.car, carNumber: ctx.message.text.toUpperCase(), colorOfCar: ctx.session.color })
        ctx.scene.exit()
    } else {
        ctx.reply('Mashinangiz raqamini quyidagi formatda kiriting!\n 01A111AA', {reply_markup: { remove_keyboard: true }})
    }
})

export default newScene