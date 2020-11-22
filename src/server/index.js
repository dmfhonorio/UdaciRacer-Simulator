const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')
const fs = require('fs');

const app = express()
const port = 3000

// setup the ability to see into response bodies
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// setup the express assets path
app.use('/', express.static(path.join(__dirname, '../client')))

// API calls ------------------------------------------------------------------------------------
app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, '../client/pages/home.html'));
})

app.get('/race', async (req, res) => {
    res.sendFile(path.join(__dirname, '../client/pages/race.html'));
})

app.get('/myRacers', async (req, res) => {
    fs.readFile(path.join(__dirname, '../../data.json'), (err, data) => {
        try {
            res.send(JSON.parse(data).cars)
        } catch (err) {
            res.send(404)
        }
    })
})

app.get('/myTracks', async (req, res) => {
    fs.readFile(path.join(__dirname, '../../data.json'), (err, data) => {
        try {
            res.send(JSON.parse(data).tracks)
        } catch (err) {
            res.send(404)
        }
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
