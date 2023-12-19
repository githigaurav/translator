const express = require("express")
const server = express()


// setting up env config file
require('dotenv').config()


server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.use(express.static("views"))

// setting up ejs
server.set("view engine", "ejs")

// setting up routes
const userRoutes = require('./routes/userRoutes') 
 

server.use('/', userRoutes)
server.get('/',(req, res)=>{
  res.render('index.ejs')
})
// setting up socket.io
const { webSocket } = require("./socket") 
const eserver = require('http').createServer(server)
webSocket(eserver)





eserver.listen(3000, () => {
  console.log("Server Status:OK")
})