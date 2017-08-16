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
const io = socket(server);
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
const messageController = require('./controllers/message.js');
const conversationController = require('./controllers/conversation.js')

//Middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());
//app.use(checkLoginToken(queryAPI));
app.use('/auth', authController(queryAPI));
app.use('/message', messageController(queryAPI));
app.use('/conversation', conversationController(queryAPI));


var server = app.listen(3000, function(){
    console.log('listening for requests on port 3000,');
});


// // Create a new user (signup)
// app.post('/users', (req, res) => {
//   let body = req.body;
//   let user = {
//     email: body.email,
//     password: body.password,
//     username: body.username
//   };
//   queryAPI.createUser(user)
//   .then(function(data){
//    console.log(data)
//    res.send("success")
//   })
//   .catch(err => {
//     console.log(err, "signup error")
//     res.send(err)
//   });
// });

  // Create a new session(login)
  // app.post('/sessions', (req,res) => {
  //   queryAPI.createTokenFromCredentials(
// 	//       req.body.email,
// 	//       req.body.password
// 	//     )
// 	//     .then(token => {
// 	// 		res.status(201).json({ token: token })
// 	// 	})
// 	//     .catch(err => res.status(401).json(err));
//   });
//
// })


//
// app.get('/login', function (req, res){
//   res.send("login page")
// })
//
//
// app.get('/', function(req, res){
//    res.send("Hello world!");
// });
//
// //receive post request from front end api call and send response
// app.get('/signup', function(req, res){
//   res.send("signup page")
// });
//
// app.get('/conversation', function(req, res){
//
// })
//



// Socket.io logic

// io.on('connection', (socket) => {
//     console.log('made socket connection', socket.id);
//
//     // Handle chat event
//     socket.on('chat', function(data){
//         console.log(data)
//         translate(data.message, {to: 'fr'})
//         .then( trans => {
//           data.message = trans.text;
//           console.log(data, "this is the data")
//           io.sockets.emit('chat', data);
//         }
//         )
//         console.log(data)
//         // console.log(data);
//     });
//
//     // Handle typing event
//     socket.on('typing', function(data){
//         socket.broadcast.emit('typing', data);
//     });
//
// });
