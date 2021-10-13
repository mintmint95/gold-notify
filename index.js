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

const getGoldPriceAPI = async () => {
  const result = await axios.get(config.baseURL)
  return result.data.response
}

const covertStringToCurrency = (str) => {
  return parseFloat(str.split(',').join(''))
}

const task = async () => {
  goldDetail = await getGoldPriceAPI()
  let currentPrice = covertStringToCurrency(goldDetail.price.gold_bar.sell)
  
  if (currentPrice <= expectedPrice) {
    if ((currentPrice !== tempPrice) || (tempPrice === 0)) {
      tempPrice = currentPrice
      const flex = templateMessage(goldDetail)
      await client.broadcast(flex)
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


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/webhook', async (req, res) => {
  res.send('test webhook')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
