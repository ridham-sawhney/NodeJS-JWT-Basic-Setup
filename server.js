require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const connectDB = require('./config/DBConfig');
const credentials = require('./middlewares/credentials');
const corsConfig = require('./config/corsConfig');
const veryfyJWT = require('./middlewares/verifyJWT');
const {logger} = require('./middlewares/logEvents');
const errorHandler = require('./middlewares/errorHandler');
const PORT = process.env.PORT || 3000;

connectDB();

app.use(logger);

// To allow browsers to include credentials in requests
app.use(credentials);
// CORS configuration
app.use(cors(corsConfig));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/test', (req, res) => {
    res.send('Hi, There!');
});

app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/login'));
app.use('/logout', require('./routes/logout'));
app.use('/refreshToken', require('./routes/refreshToken'));
app.use('/api/auth/google', require('./routes/googleAuth'));


// Restricted routes can be added here using verifyJWT middleware
app.use(veryfyJWT);

app.use('/shipments',require('./routes/apis/shipments'));

app.get('/restricted',(req,res)=>{
    res.json({message:"You have accessed a restricted route",user:req.user});
})

app.use(errorHandler);
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB database');
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});