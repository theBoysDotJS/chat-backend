"use strict"

//import express library
const express = require("express");
const bodyParser= require("body-parser");
const morgan= require("morgan");
const session= require("express-session");
const mysql = require('promise-mysql');
const cors = require('cors');
const socket = require('socket.io');
// temp translate API
const translate = require('google-translate-api');

const checkLoginToken = require('./lib/check-login-token.js');
// Create new express web server
const app = express();


// Data Loader
const Query = require('./lib/Query');

// Create a connection to the DB
const connection = mysql.createPool({
   host     : 'localhost',
   user     : 'root',
   password : 'password',
   database : 'chat_box'
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
app.use(checkLoginToken(queryAPI));
app.use('/auth', authController(queryAPI));
app.use('/message', messageController(queryAPI));
app.use('/conversation', conversationController(queryAPI));

app.get('/', function (req, res){
  res.sendFile(__dirname + '/index.html');
})


var server = app.listen(3000, function(){
    //console.log('listening for requests on port 3000,');
});

