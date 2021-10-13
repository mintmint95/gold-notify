const express = require('express')
const cron = require('node-cron')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/webhook', (req, res) => {
  res.send('test webhook')
})

cron.schedule('* * * * *', () => {
   console.log('Running a task every minute at Asia/Bangkok');
 }, {
   scheduled: true,
   timezone: "Asia/Bangkok"
 });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})