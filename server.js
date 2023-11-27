const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const connectToDatabase = require('./Database/conn')
const router = require('./router/route')
// const protectedrouter = require('./router/protectedRoute')
const corsOptions = require('./config/corsOptions')
const https = require('https')
const dotenv = require("dotenv");
// const coinbaseapi = require('./coinbase_pay/payment')

// Load environment variables from .env file
dotenv.config({ path: ".env" });



const app = express();

app.use(express.json())

app.use(cors(corsOptions))
app.use(morgan('tiny'))
app.disable('x-powered-by')
app.use(express.json())

connectToDatabase();
// coinbaseapi();
const port = process.env.PORT || 8080 


// HTTP GET request

app.get('/', (req, res) => {
    res.send('App is Running')
});

// api route
app.use('/api', router)

  
// Start Server 

app.listen(port, () => {
    console.log(`Server connected to http://localhost:${port}`)
})