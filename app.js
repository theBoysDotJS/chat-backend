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
const connection = mysql.createPool({
     host: process.env.SQL_HOST,
     user: process.env.SQL_USER,
     password: process.env.SQL_PASS,
     database: process.env.SQL_DB,
     connectionLimit: process.env.POOLS || 2
});


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
	// Handle chat event
	socket.on('chat', function(data) {

		queryAPI.messageReceived(data).then(result => {
			data["messageId"] = result.insertId
		})

		queryAPI.getAllUsersInConversation(data.convoId).then(userArr => {
			let promiseArr = new Array()
			userArr.forEach((user, i) => {
				if(user.language.length !== 2) {
					user.language === 'en'
				}
				
				data.avatar = user.avatarUrl;
				var t = translate(data.text, {to: user.language})
					.then(trans => {
						let transTexts =  {
								language: user.language,
								text: trans.text
							}

						data.text = transTexts
						return transTexts;
					}) // end t
				promiseArr.push(t)
			})// language for each
			return Promise.all(promiseArr)
		}) // end userArr then
		.then(translations => {
			let textObj = {}
			translations.map((translation) => {
				textObj[translation.language] = translation.text
			})
			data.text = textObj;
			io.sockets.emit('chat', data);
		})
	}) // end socket.on chat

	// Handle typing event
	socket.on('typing', data => {
		socket.broadcast.emit('typing', data);
	});
}); // end socket.on connection
