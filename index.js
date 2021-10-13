const express = require('express')
const cron = require('node-cron')
const axios = require('axios')
const line = require('@line/bot-sdk')
const app = express()
const port = 3000
require('dotenv').config()

let goldDetail =  {}
let expectedPrice = +process.env.EXPECTED_PRICE || 28000
let tempPrice = 0

const client = new line.Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))

const config = {
  schedule: '* * * * *',
  baseURL: 'https://thai-gold-api.herokuapp.com/latest',
  timezone: 'Asia/Bangkok'
}

const task = async () => {
  const res = await axios.get(config.baseURL)
  goldDetail = res.data.response

  let currentPrice = parseFloat(goldDetail.price.gold_bar.sell.split(',').join(''))

  if (currentPrice <= expectedPrice) {
    if ((currentPrice !== tempPrice) || (tempPrice === 0)) {
      tempPrice = currentPrice
      await client.broadcast(templateMessage(goldDetail))
    }
  }
}

const templateMessage = (obj) => {
  let text = `ประจำวันที่ ${obj.date}
  ${obj.update_time}
  
  🏆 ทองคำแท่ง 96.5%
  - ขายออก:  ${obj.price.gold_bar.buy}
  - รับซื้อ:      ${obj.price.gold_bar.sell}
    
  👑 ทองรูปพรรณ 96.5%
  - ขายออก:  ${obj.price.gold.buy}
  - รับซื้อ:      ${obj.price.gold.sell}
  `

  return { type: 'text', text }
}

cron.schedule(config.schedule, task, { timezone: config.timezone })


// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

// app.post('/webhook', async (req, res) => {
//   const replyToken = req.body.events[0].replyToken
//   await task()
//   const message = templateMessage(goldDetail)

//   await client.replyMessage(replyToken, message)
//   res.send('test webhook')
// })

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
