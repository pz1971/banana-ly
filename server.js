const express = require('express')
const mongoose = require('mongoose')
const ShortUrl = require('./models/shortUrl')
const User = require('./models/user')
const Txn = require('./models/txn')
const Ad = require('./models/ad')
const shortUrl = require('./models/shortUrl')
const app = express()

mongoose.connect('mongodb://localhost/bananaLy', {
    useNewUrlParser: true, useUnifiedTopology: true
})

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

app.get('/', async (req, res) => {
    res.render('index', { shortUrls: { short: "" } })
})

app.post('/', async (req, res) => {
    const x = await ShortUrl.findOne({ full: req.body.fullUrl, userEmail: 'admin' })
    if (x == null) {
        await ShortUrl.create({ full: req.body.fullUrl })
        res.render('index', { shortUrls: await ShortUrl.findOne({ full: req.body.fullUrl, userEmail: 'admin' }) })
    }
    else {
        res.render('index', { shortUrls: x })
    }
})

app.post('/SignUpLogIn', (req, res) => {
    res.render('SignUpLogIn')
})
// app.post('/SignUpLogIn', (req, res) => {
    //     res.render('signup_login')
    // })

app.post('/signUpButtonAction', async (req, res) => {
    const x = await User.findOne({ userEmail: req.body.email })
    if (x == null) {
        await User.create({ name: req.body.name, userEmail: req.body.email, password: req.body.password })
        res.render('userHome', { User: await User.findOne({ userEmail: req.body.email }), shortUrls: { short: "" }, urlList:[] })
    }
    else {
        // already registered with this email
        return res.sendStatus(404)
    }
})
app.post('/logInButtonAction', async (req, res) => {
    const x = await User.findOne({ userEmail: req.body.email2 })
    if (x == null) {
        // not registered
        return res.sendStatus(404)
    }
    else {
        if (req.body.password2 == x.password){
            const urlList = await shortUrl.find({ userEmail: req.body.email2 }).limit(3) ;
            // console.log(urlList) ;
            res.render('userHome', { User: x, shortUrls: { short: "" }, urlList: urlList })
        }
        else
        return res.sendStatus(404)
    }
})

app.post('/uShrink', async (req, res) => {
    const f = (req.body.toggle == "monetized") // monetized option is checked or not
    const x = await ShortUrl.findOne({ full: req.body.fullUrl, userEmail: req.body.email, monetized: f })
    const urlList = await shortUrl.find({ userEmail: req.body.email }).limit(3) ;
    
    if (x == null) {
        await ShortUrl.create({ full: req.body.fullUrl, userEmail: req.body.email, monetized: f })
        res.render('userHome', {
            shortUrls: await ShortUrl.findOne({ full: req.body.fullUrl, userEmail: req.body.email, monetized: f }),
            User: await User.findOne({ userEmail: req.body.email }),
            urlList: urlList
        })
    }
    else {
        res.render('userHome', {
            shortUrls: x,
            User: await User.findOne({ userEmail: req.body.email }),
            urlList: urlList
        })
    }
})

app.get('/u/:user_email', async (req, res) => {
    const user = await User.findOne({ userEmail: req.params.user_email })
    if (user == null)
        return res.sendStatus(404)
    else 
        res.render('user', {User: user})
})

app.post('/editUserInfo', async (req, res) => {
    const user = await User.findOne({ userEmail: req.body.email }) ;
    if (user == null)
    return res.sendStatus(404)
    
    user.name = req.body.name ;
    user.password = req.body.new_password ;
    user.save() ;
    
    res.render('SignUpLogIn')
})
app.post('/managePage', async (req, res) => {
    res.render('managePage')
})

app.post('/wallet', async (req, res) => {
    res.render('wallet')
})

app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
    if (shortUrl == null)
        return res.sendStatus(404)

    shortUrl.clicks++
    shortUrl.save()

    res.redirect(shortUrl.full)
})

app.listen(process.env.PORT || 5000);
