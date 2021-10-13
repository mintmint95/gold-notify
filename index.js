const express = require('express')
const cron = require('node-cron')
const axios = require('axios')

const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/webhook', (req, res) => {
  res.send('test webhook')
})

cron.schedule('* * * * *', () => {
   //console.log('Running a task every minute at Asia/Bangkok');
   axios.get('https://thai-gold-api.herokuapp.com/latest')
   .then(function (response) {
    // handle success
      console.log(response.data);
    })
 }, {
   scheduled: true,
   timezone: 'Asia/Bangkok'
 });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
