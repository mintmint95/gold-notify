const express = require('express')
const cron = require('node-cron')
const axios = require('axios')
const line = require('@line/bot-sdk')
const cors = require('cors')
const app = express()
require('dotenv').config()

let goldDetail = {}
let expectedPrice = parseFloat(process.env.EXPECTED_PRICE || 28000).toFixed(2)
let tempPrice = 0

const client = new line.Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))
app.set('port', 3000)

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
  // let text = `ประจำวันที่ ${obj.date}
  // ${obj.update_time}

  // 🏆 ทองคำแท่ง 96.5%
  // - ขายออก:  ${obj.price.gold_bar.buy}
  // - รับซื้อ:      ${obj.price.gold_bar.sell}

  // 👑 ทองรูปพรรณ 96.5%
  // - ขายออก:  ${obj.price.gold.buy}
  // - รับซื้อ:      ${obj.price.gold.sell}
  // `
  let text = `{
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "New⚡️",
          "weight": "bold",
          "color": "#1DB446",
          "size": "sm"
        },
        {
          "type": "text",
          "text": "ราคาทอง",
          "weight": "bold",
          "size": "xxl",
          "margin": "md"
        },
        {
          "type": "text",
          "text": "ประจำวันที่ ${obj.date} | ${obj.update_time}",
          "size": "xs",
          "color": "#aaaaaa",
          "wrap": true
        },
        {
          "type": "separator",
          "margin": "xxl"
        },
        {
          "type": "box",
          "layout": "vertical",
          "margin": "xxl",
          "spacing": "sm",
          "contents": [
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "text",
                  "text": "🏆 ทองคำแท่ง 96.5% ",
                  "size": "sm",
                  "color": "#555555",
                  "flex": 0,
                  "weight": "bold"
                }
              ]
            },
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "text",
                  "text": "ขายออก",
                  "size": "sm",
                  "color": "#555555",
                  "flex": 0
                },
                {
                  "type": "text",
                  "text": "${obj.price.gold_bar.buy} ฿",
                  "size": "sm",
                  "color": "#111111",
                  "align": "end"
                }
              ]
            },
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "text",
                  "text": "รับซื้อ",
                  "size": "sm",
                  "color": "#555555",
                  "flex": 0
                },
                {
                  "type": "text",
                  "text": "${obj.price.gold_bar.sell} ฿",
                  "size": "sm",
                  "color": "#111111",
                  "align": "end"
                }
              ]
            },
            {
              "type": "separator",
              "margin": "xxl"
            },
            {
              "type": "box",
              "layout": "horizontal",
              "margin": "xxl",
              "contents": [
                {
                  "type": "text",
                  "text": "👑 ทองรูปพรรณ 96.5%",
                  "size": "sm",
                  "color": "#555555",
                  "weight": "bold"
                }
              ]
            },
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "text",
                  "text": "ขายออก",
                  "size": "sm",
                  "color": "#555555"
                },
                {
                  "type": "text",
                  "text": "${obj.price.gold.buy} ฿",
                  "size": "sm",
                  "color": "#111111",
                  "align": "end"
                }
              ]
            },
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "text",
                  "text": "รับซื้อ",
                  "size": "sm",
                  "color": "#555555"
                },
                {
                  "type": "text",
                  "text": "${obj.price.gold.sell} ฿",
                  "size": "sm",
                  "color": "#111111",
                  "align": "end"
                }
              ]
            }
          ]
        },
        {
          "type": "separator",
          "margin": "xxl"
        },
        {
          "type": "box",
          "layout": "horizontal",
          "margin": "md",
          "contents": [
            {
              "type": "text",
              "text": "EXPECTED PRICE",
              "size": "xs",
              "color": "#aaaaaa",
              "flex": 0
            },
            {
              "type": "text",
              "text": "${new Intl.NumberFormat('en-IN').format(expectedPrice)} ฿",
              
              "color": "#aaaaaa",
              "size": "xs",
              "align": "end"
            }
          ]
        }
      ]
    },
    "styles": {
      "footer": {
        "separator": true
      }
    }
}`

  // return { type: 'text', text }
  return {
    type: "flex",
    altText: 'New update ⚡️ ราคาทอง',
    contents: JSON.parse(text),
  }
}

// cron.schedule(config.schedule, task, {
//   timezone: config.timezone
// })


app.get('/test', (req, res) => {
  res.send('Hello World!')
})

app.post('/webhook', async (req, res) => {
  res.send('test webhook')
})

app.listen(app.get('port'), () => {
  console.log(`Start`, app.get('port'))
})
