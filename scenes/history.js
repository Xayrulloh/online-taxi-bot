import { Scene } from 'grammy-scenes'
import Data from '#database'

let newScene = new Scene('History'), passengers = [], passengerId;

newScene.do( async(ctx) => {
    if (await Data.models.driver.findOne({ userId: ctx.update.message.from.id })) {
        let data = await Data.models.history.findOne({userId: ctx.update.message.from.id}) 
        if (data) {
            ctx.reply(`Barcha yetkazib qoyilgan haydovchilar soni: ${data.client}\nSumma miqdori: ${data.money}`)
            ctx.scene.exit()
        } else {
            ctx.reply('Hozirda hech qanday malumot yo\'q')
        }   
    } else {
        ctx.reply("Avval ro'yxatdan o'tishingiz lozim")
        ctx.scene.exit()
    }
})

export default newScene