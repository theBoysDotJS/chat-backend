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


// Require Query Class
const Query = require('./lib/Query');

// Create a connection to the DB
const connection = mysql.createPool({
   host     : 'localhost',
   user     : 'root',
   password : 'password',
   database : 'chat_box',
});

let query = new Query(connection);

// Create new express web server
const app = express();

//Middleware
// This middleware will log every request made to your web server on the console.
app.use(morgan('dev'));
app.use(bodyParser.json());
  // query.test().then(function(data){
  //  console.log(data);
  // });
app.use(cors())



var server = app.listen(3000, function(){
    console.log('listening for requests on port 3000,');
});



app.get('/', function(req, res){
   res.send("Hello world!");
});

//receive post request from front end api call and send response
app.get('/signup', function(req, res){
  res.send("signup page")
});


app.post('/signup', function(req, res){

 // parse data and create a new object
  let body = req.body;
  //console.log("body",body)
  let user = {

    email: body.email,
    password: body.password,
    username: body.username
  };
  query.createUser(user)
  .then(function(data){
   console.log(data)
   res.send("success")
  })
  .catch(err => {
    console.log(err, "signup error")
    res.send(err)
  });
});


app.get('/login', function (req, res){
  res.send("login page")
})


app.post('/login', function (req,res){
  res.send("post login!");
})





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
