// server.js

// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/node-login-signup', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB', err));

// Import models
const User = require('./models/User');
const Cart = require('./models/Cart');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Routes
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email, password });
        await user.save();
        res.status(201).send('User created successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (user) {
            res.send('Login successful');
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/updateCart', async (req, res) => {
    try {
        const { username, bookName, price, quantity } = req.body;

        console.log('Received request to update cart:', req.body);

        // Check if the username is provided
        if (!username) {
            console.log('Username not provided');
            return res.status(400).send('Username not provided');
        }

        // Update or create the cart entry
        let cart = await Cart.findOne({ username, bookName });
        if (cart) {
            // Update existing cart entry
            cart.price = price;
            cart.quantity = quantity;
        } else {
            // Create new cart entry
            cart = new Cart({ username, bookName, price, quantity });
        }

        // Save the cart entry
        await cart.save();

        console.log('Cart updated successfully');

        res.status(200).send('Cart updated successfully');
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
