const express = require('express')
const cron = require('node-cron')
const axios = require('axios')
const app = express()
const port = 3000

const config = {
  schedule: '* * * * *',
  baseURL: 'https://thai-gold-api.herokuapp.com/latest',
  timezone: 'Asia/Bangkok'
}

const task = async () => {
  // implementation
  const res = await axios.get(config.baseURL)
  console.log(JSON.stringify(res.data))
}

cron.schedule(config.schedule, task, { timezone: config.timezone })


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/webhook', (req, res) => {
  res.send('test webhook')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
