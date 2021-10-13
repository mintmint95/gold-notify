const express = require('express')
const cron = require('node-cron')
const axios = require('axios')
const line = require('@line/bot-sdk')
const app = express()
const port = 3000
require('dotenv').config()

let goldDetail =  {}

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
  // implementation
  const res = await axios.get(config.baseURL)
  console.log(JSON.stringify(res.data))
  goldDetail = res.data.response
}

// cron.schedule(config.schedule, task, { timezone: config.timezone })


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/webhook', async (req, res) => {
  const text = req.body.events[0].message.text
  const replyToken = req.body.events[0].replyToken

  console.log(req.body.events)
  console.log(text)

  await task()

  let msg = `
  ประจำวันที่ ${goldDetail.date}
  ${goldDetail.update_time}
  
  🏆 ทองคำแท่ง 96.5%
  - ขายออก:  ${goldDetail.price.gold_bar.buy}
  - รับซื้อ:      ${goldDetail.price.gold_bar.sell}
    
  👑 ทองรูปพรรณ 96.5%
  - ขายออก:  ${goldDetail.price.gold.buy}
  - รับซื้อ:      ${goldDetail.price.gold.sell}
  `

  const message = {
    type: 'text',
    text: msg
  }

  await client.replyMessage(replyToken, message)

  res.send('test webhook')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
