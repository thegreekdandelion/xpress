const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongodbPassword = 'YiKvUmtlxIfSLMOB'

const app = express();
app.use(express.json());

// mongoose.connect('mongodb://localhost/newapp', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }).then(() => console.log('MongoDB Connected'))
//     .catch(err => console.log(err));
mongoose.connect(`mongodb+srv://user01:${mongodbPassword}@cluster0.io5zjvu.mongodb.net/`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

app.get('/', (req, res) => {
    res.send('Hello, Express!')
})

const User = mongoose.model('User', userSchema);

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send({error: 'Username already exists'});
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // number 10 means salt rounds

        // Create a new user and save the database
        const user = new User({
            username,
            password: hashedPassword
        });

        await user.save();

        res.status(201).send({message: 'User registered successfully'})
    } catch (error) {
        console.log('User not registered', error); // this error shows in logs
        res.status(500).send({error: 'Internal Server Error'}); // this error shows to client
    }
});

// User Login Route
app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    try {
        const user = await User.findOne({username});
        if (!user) {
            console.log('Invalid username or password');
            return res.status(401).send({error: 'Invalid username or password'});
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({error: 'Invalid username or password'});
        }

        // Create a JWT token
        const token = jwt.sign({userId: user._id}, 'yourJWTSecret', {expiresIn: '1h'});
        res.send({token});

    } catch (error) {
        res.status(500).send({error: 'Internal Server Error'});
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});