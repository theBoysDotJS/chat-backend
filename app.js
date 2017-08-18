"use strict"

//import express library
const express = require("express");
const app = express();
const bodyParser= require("body-parser");
const morgan= require("morgan");
const session= require("express-session");
const mysql = require('promise-mysql');
const cors = require('cors');
const http = require('http').createServer(app)
const io = require('socket.io')(http);
// temp translate API
const translate = require('google-translate-api');
const checkLoginToken = require('./lib/check-login-token.js');
// Create new express web server




// Data Loader
const Query = require('./lib/Query');

// Create a connection to the DB
const connection = mysql.createPool({
  user: 'root',
  database: 'chat_box'
});

const queryAPI = new Query(connection);

// Controllers
const authController = require('./controllers/auth.js');
const conversationController = require('./controllers/conversation.js');
const messageController = require('./controllers/message.js');


//Middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());
// CORS configuration
// app.use(function (req, res, next) {
//         res.setHeader('Access-Control-Allow-Origin', "http://localhost:3001");
//         res.setHeader('Access-Control-Allow-Credentials', 'true');
//
//         res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//         res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//         next();
//     }
// );

app.use(checkLoginToken(queryAPI));
app.use('/auth', authController(queryAPI));
app.use('/message', messageController(queryAPI));
app.use('/conversation', conversationController(queryAPI));

app.get('/', function (req, res){
  res.sendFile(__dirname + '/index.html');
})


 let port = 3000;
 http.listen(port, function(){
    console.log(`listening for requests on port ${port}`);
});

// Socket.io logic

io.on('connection', (socket) => {
    console.log('made socket connection', socket.id);
    // Handle chat event
    socket.on('chat', function(data){
        // get the chatroom ID
        // req.params.id for the URL
        // function to save data to database...
        // only recieve messages.
        //

        // if statements to filter the data.
        console.log(data, "this is the new log")
        translate(data.text, {to: 'fr'})
        .then( trans => {
          data.text = trans.text;
          console.log(data, "this is the data")
          io.sockets.emit('chat', data);
        }
        )
        console.log(data, "look at me")
        // console.log(data);

    });

    // Handle typing event
    socket.on('typing', function(data){
        socket.broadcast.emit('typing', data);
    });

});
