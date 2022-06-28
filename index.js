const express = require('express')
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const initializePassport = require('./passport-config');
const dotenv = require('dotenv').config()
const Users = require('./schemas/Users')
const SoldItems = require('./schemas/SoldItems')
const Items = require('./schemas/Items')
const Comments = require('./schemas/Comments');

const app = express()
const port = 5000

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.gfqwd.mongodb.net/?retryWrites=true&w=majority` , {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('LOG: connected to mongo')
});

initializePassport(passport, async (name) =>{
    return await Users.findOne({name: name})
}, async (id) =>{
    return await Users.findById(id)
})


app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(session({
    secret: "mySecret",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))



app.get('/', async (req, res)=>{
    try {
        const data = await Items.find()
        const comments=await Comments.find()
        const user = await req.user
        res.render('index.ejs', {
            data: data,
            comments: comments,
            user: user
        })
        
    } catch (error) {
        console.log(error);
    } 
})

app.get('/item/:id',async (req,res)=>{
    try {
        const user = await req.user
        const data = await Items.findById(req.params.id)
        // const resData = data.find(d => d.id == req.params.id)
        res.render('item' ,{data: data, user: user})
    } catch (error) {
        console.log(error);
    }
    
})


app.get('/originalDesigns', async (req, res)=>{
    try {
        const user = await req.user
        const data = await Items.find({type: 'painting' })
        // const sortedData = data.filter((d)=>{return d.type == 'painting'})
        res.render('originalDesigns', {data: data, user: user})
    } catch (error) {
        console.log(error);
    }
})
app.get('/paperLamps', async (req, res)=>{
    try {
        const user = await req.user
        const data = await Items.find({type: 'lamp' })
        // const sortedData = data.filter((d)=>{return d.type == 'painting'})
        res.render('paperLamps', {data: data, user: user})
    } catch (error) {
        console.log(error);
    }
})
app.get('/handmadeJewellery', async (req, res)=>{
    try {
        const user = await req.user
        const data = await Items.find({type: 'jewellery' })
        // const sortedData = data.filter((d)=>{return d.type == 'painting'})
        res.render('handmadeJewellery', {data: data, user: user})
    } catch (error) {
        console.log(error);
    }
})
app.get('/login', checkNotAuthenticated, async(req, res)=>{
    try {
        const user = await req.user
        res.render('login', {user: user})
    } catch (error) {
        console.log(error);
    }
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/makeNewUser', checkNotAuthenticated, async (req, res) =>{
    try {
        const reqData = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
        }
        const newUser = new Users({ name: reqData.username, email: reqData.email, password: reqData.password })
        await newUser.save()
        res.redirect('/')
        
    } catch (error) {
        console.log(error);
        res.redirect('/login?err="userExist"')
    }
    
})
app.post('/newComment',async (req,res)=>{
    try {
        const user = await req.user
        const newComment=new Comments({username:user.name, text:req.body.myComment})
        await newComment.save()
        res.redirect('/')
        
    } catch (error) {
        console.log(error);
    }
})
app.post('/buy', async (req, res)=>{
    try {
        let info = await req.body
        const newSell = new SoldItems({
            price: info.price,
            title: info.title,
            clientName: info.clientName,
            clientAddres: info.clientAddres,
            clientPhone: info.clientPhone,
        })
        await newSell.save()
        // await Items.deleteOne({"title": info.clientName})
       
        res.redirect("/")
    } catch (error) {
        console.log(error);
    }
})
app.get('/success', (req, res)=>{
    res.send("success!")
})

///////////temp//////////////
// app.get('/populateItemsFromDummyData', async(req, res)=>{
//     try {
//         const data = require('./dummyData')
//         data.forEach(async (item)=>{
//             const newItem = new Items({
//                 title: item.title,
//                 price: item.price,
//                 img: item.img,
//                 type: item.type
//             })
//             await newItem.save()
//         })
//         res.send('we good')
//     } catch (error) {
//         console.log(error);
//     }
// })

app.delete('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/login');
    });
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
  
    res.redirect('/login')
}
  
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(port, ()=>{
    console.log(`LOG: we are running on port ${port}`);
})

