"use strict"

//import express library
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const session = require("express-session");
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
// const connection = mysql.createPool({
// 	 host: 'localhost',
// 	 user: 'root',
// 	 database: 'chat_box'
//  }
//  );

 // Create a connection to the DB
const connection = mysql.createPool({
     host: process.env.SQL_HOST,
     user: process.env.SQL_USER,
     password: process.env.SQL_PASS,
     database: process.env.SQL_DB,
 	 connectionLimit: process.env.POOLS || 2
 	}
 );

const queryAPI = new Query(connection);

// Controllers
const authController = require('./controllers/auth.js');
const conversationController = require('./controllers/conversation.js');
const messageController = require('./controllers/message.js');

//Middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
// app.use(cors());

// Add headers
app.use(function(req, res, next) {
	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', '*'); //change this after testing
	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true);
	// Pass to next layer of middleware
	next();
});

app.use(checkLoginToken(queryAPI));
app.use('/auth', authController(queryAPI));
app.use('/message', messageController(queryAPI));
app.use('/conversation', conversationController(queryAPI));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
})

let port = 3001;
http.listen(process.env.PORT || port, function() {
	console.log(`listening for requests on port ${port}`);
});

// Socket.io logic
io.on('connection', (socket) => {
	console.log('made socket connection', socket.id);
	// Handle chat event
	socket.on('chat', function(data) {
		console.log('message recieved')
		queryAPI.messageReceived(data).then(result => {
			data["messageId"] = result.insertId

			queryAPI.getUserLanguage(data.user).then(rowData => {
				console.log(rowData, 'this is query return')
				translate(data.text, {to: rowData[0].language}).then(trans => {
					data.text = trans.text;
					io.sockets.emit('chat', data);
				})
			})

		})
	}); // end socket.on

	// Handle typing event
	socket.on('typing', data => {
	    socket.broadcast.emit('typing', data);
	});

});
