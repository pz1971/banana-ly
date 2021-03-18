const express = require('express')
const mongoose = require('mongoose')
const ShortUrl = require('./models/shortUrl')
const app = express()

mongoose.connect('mongodb://localhost/bananaLy', {
    useNewUrlParser: true, useUnifiedTopology: true
})

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended:false }))

app.get('/', async (req, res) => {
    res.render('index', {shortUrls: {short:""}})
})

app.post('/', async (req, res) => {
    const x = await ShortUrl.findOne({ full: req.body.fullUrl, userEmail: 'admin' }) 
    if(x == null){
        await ShortUrl.create({full: req.body.fullUrl})
        res.render('index', {shortUrls: await ShortUrl.findOne({full: req.body.fullUrl, userEmail: 'admin'})})
    }
    else{
        res.render('index', {shortUrls : x})
    }
})

app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl }) 
    if(shortUrl == null)
        return res.sendStatus(404)
    
    shortUrl.clicks++
    shortUrl.save()
    
    res.redirect(shortUrl.full)
})

app.listen(process.env.PORT || 5000);
