if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Product = require('./models/product');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const { title } = require('process');
const Review = require('./models/review');
const methodOverride = require('method-override');
const multer = require('multer');
const {storage} = require('./cloudinary');
const { url } = require('inspector');
const passport = require('passport');
const upload = multer({storage});
const LocalStrategy = require('passport-local');
const session = require('express-session');
const User = require('./models/user');
const flash = require('connect-flash');
const {isLoggedIn} = require('./middelware');

mongoose.connect('mongodb://127.0.0.1:27017/chairished')
    .then(() => {
        console.log("Connection Open !!!");
    }).catch((e) => {
        console.log("Error!!!", e);
    });

app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true }));

const staticPath = path.join(__dirname, 'public');
app.use(express.static(staticPath));

const validateProduct = (req,res,next) =>{
    const productSchema = Joi.object({
        product: Joi.object({
            title : Joi.string().required(),
            price : Joi.number().required(),
            material : Joi.string().required(),
            color: Joi.string().required(),
            dimention : Joi.string().required(),
            storage : Joi.string().required(),
            description : Joi.string().required(),
            stock : Joi.number().required(),
            category : Joi.string().required()
        }).required()
    })
    const { error } = productSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(e => e.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

const validateReview  = (req,res,next) =>{
    const reviewSchema = Joi.object({
        review : Joi.object({
            body : Joi.string().required(),
            rating : Joi.number().required()
        }).required()
    })
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(e => {
            e.message;
        }).join(',');
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}

const sessionConfig = {
    secret : 'thisshouldbebettersecret!',
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge : 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) =>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

    // Initialize cart
    if (!req.session.cart) {
        req.session.cart = [];
    }

    next();
})


app.get('/', catchAsync(async (req, res) => {
    const randomProducts = await Product.aggregate([{ $sample: { size: 8 } }]);
    res.render('products/home', { randomProducts });
}));

app.get('/register',(req,res) =>{
    res.render('user/form');
})

app.post('/register',catchAsync(async(req,res,next) =>{
    try {
        const {email , username , password} = req.body;
        const user = new User({email,username});
        const registerUser = await User.register(user,password);
        req.login(registerUser,err =>{
            if(err) return next(err);
            req.flash('success', 'Successfully registered!');
            res.redirect('/login');
        })
    } catch (error) {
        req.flash('error', error.message); 
        res.redirect('/register');
    }
}))

app.get('/login',(req,res) =>{
    res.render('user/form');
})

app.post('/login', passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}), (req, res) => {
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;  // Clear returnTo after redirect
    res.redirect(redirectUrl);  
});

app.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
}); 


app.get('/products', catchAsync(async (req, res) => {
    const products = await Product.find();
    res.render('products/index', { products });
}))

app.get('/products/new' ,(req, res) => {
    res.render('products/new');
})

app.post('/products',  upload.array('image'),validateProduct , catchAsync(async (req, res, next) => {
    const { product } = req.body;
    product.storage = product.storage === 'true';
    product.color = product.color.split(',').map(col => col.trim());
    product.images = req.files.map(f => ({url : f.path , filename : f.filename}));
    const newProduct = new Product(product);
    newProduct.save();
    res.redirect(`/products/${newProduct._id}`);
}))



app.get('/products/:id', catchAsync(async (req, res) => {
    const id = req.params.id;
    const products = await Product.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author',
            select: 'username'
        }
    });;
    res.render('products/show', { products });
}))

app.post('/products/:id/reviews', isLoggedIn ,validateReview , async(req,res) =>{
    const product = await Product.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    product.reviews.push(review);
    await review.save();
    await product.save();
    req.flash('success',"Your review successfully addeed.");
    res.redirect(`/products/${product._id}`);
})

app.delete('/products/:id/reviews/:reviewId', isLoggedIn ,catchAsync(async(req,res) =>{
    const {id , reviewId} = req.params;
    await Product.findByIdAndUpdate(id, { $pull : {reviews : reviewId}});
    const review = await Review.findByIdAndDelete(reviewId);
    res.redirect(`/products/${id}`);
}))

app.get('/products/category/:category', catchAsync(async (req, res) => {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.render('products/index', { products });
}));

app.post('/cart/add/:id', isLoggedIn ,async (req, res) => {
    const { id } = req.params;
    const { unit, tenure, color } = req.body; // Ensuring correct mapping

    try {
        const product = await Product.findById(id);
        if (product) {
            req.session.cart.push({
                id: product._id,
                title: product.title,
                price: parseFloat(product.price),
                material: product.material,
                color: color,  // Corrected to align with form
                dimension: product.dimention, // Consistency with 'dimension'
                quantity: parseInt(unit, 10), // Updated from tenure to unit for clarity
                time: tenure, // Store tenure directly
                images: product.images.map(img => img.url)
            });
            req.flash('success', `${product.title} added to cart!`);
        } else {
            req.flash('error', 'Product not found!');
        }
    } catch (e) {
        console.error(e);
        req.flash('error', 'Error adding product to cart.');
    }
    res.redirect('/products');
});

app.get('/cart' , isLoggedIn ,(req,res) =>{
    const cart = req.session.cart || [];
    
    // Calculate the subtotal based on the items in the cart
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity * item.time), 0);
    const shipping = 250; // Fixed shipping cost
    const taxRate = 0.18; // 18% tax rate
    const tax = subtotal * taxRate; // Calculate tax as 18% of subtotal
    const total = subtotal + shipping + tax; // Total cost including shipping and tax

    res.render('products/cart', { cart, subtotal, shipping, tax, total });
})

app.delete('/cart/remove/:id', isLoggedIn ,(req, res) => {
    const { id } = req.params;
    const index = req.session.cart.findIndex(item => item.id.toString() === id);

    if (index !== -1) {
        req.session.cart.splice(index, 1);
        req.flash('success', 'Item removed from cart!');
    } else {
        req.flash('error', 'Item not found in cart!');
    }
    
    res.redirect('/cart');
});

app.post('/search',catchAsync(async(req,res) =>{
    const {search_item} = req.body; 
        const products = await Product.find({ category: search_item });
        res.render('products/index', { products });
}))


app.all('*',(req,res,next) =>{
    next(new ExpressError('Page not found',404));
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if (!err.message) {
        err.message = 'Something went wrong !!!';
    }
    res.status(statusCode).render('error',{err});
})

app.listen(3000, () => {
    console.log("listening on port 3000!!!")
})