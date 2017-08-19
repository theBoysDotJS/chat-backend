"use strict"

//import express library
const express = require("express");
const app = express();
const bodyParser= require("body-parser");
const morgan= require("morgan");
const session= require("express-session");
const mysql = require('promise-mysql');
const cors = require('cors');

// temp translate API
const translate = require('google-translate-api');
const checkLoginToken = require('./lib/check-login-token.js');

// Create new express web server

const http = require('http').createServer(app)
const io = require('socket.io')(http);


// Data Loader
const Query = require('./lib/Query');

// Create a connection to the DB
const connection = mysql.createPool({
   host     : 'us-cdbr-iron-east-05.cleardb.net',
   user     : 'b537a8dc95ca1e',
   password : '6b5c43b1',
   database : 'heroku_fd5680f97c93408'
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

// app.use(function (req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', "https://theboyschatapp.herokuapp.com");
//   res.setHeader('Access-Control-Allow-Credentials', 'true');
//
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//   next();
// }
// );

app.use(checkLoginToken(queryAPI));
app.use('/auth', authController(queryAPI));
app.use('/message', messageController(queryAPI));
app.use('/conversation', conversationController(queryAPI));

app.get('/', function (req, res){
  res.sendFile(__dirname + '/index.html');
})


let port = 3001;
http.listen(port, function(){
   console.log(`listening for requests on port ${port}`);

});

// Socket.io logic

io.on('connection', (socket) => {

  console.log('made socket connection', socket.id);
  // Handle chat event
  socket.on('chat', function(data){


    queryAPI.messageReceived(data)
    .then(result => {
      data["messageId"]=result.insertId

      queryAPI.getUserLanguage(data.user)
      .then(rowData=> {

        translate(data.text, {to:
          rowData[0].language})
        .then( trans => {
          data.text = trans.text;

          //add user.id in my text

          //kind of a return

          io.sockets.emit('chat', data);
        })
      })

    })
  });

  // Handle typing event
  // socket.on('typing', function(data){
  //     socket.broadcast.emit('typing', data);
  // });


});
