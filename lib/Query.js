'use strict';
const bcrypt = require('bcrypt');
const knex = require('knex')({client: 'mysql'});
const validate = require('./validations');
const HASH_ROUNDS = 10;
const USER_FIELDS = [
	'id',
	'email',
	'username',
	'password',
	'firstName',
	'lastName',
	'language',
	'avatarUrl'
];
const MESSAGE_FIELDS = ['author', 'message_body', 'type', 'conversation_id'];
const MESSAGE_WRITE_FIELDS = ['message_body'];
const CONVERSATION_FIELDS = ['id', 'name', 'admin', 'created_at'];
const CONVERSATIONUSER = ['user_id', 'conversation_id'];
const util = require('./util');
const md5 = require('md5')
const translate = require('google-translate-api');

class Query {
	constructor(conn) {
		this.conn = conn;
	}

	query(sql) {
		return this.conn.query(sql);
	}

	// Auth functions

	createUser(user) {
		const errors = validate.signupValidations(user);
		if (errors) {
			//console.log("errors, line 37 Query.js")
			return Promise.reject({error: errors});
		}

		if (!user.avatarUrl) {
			let email = md5(user.email);
			user.avatarUrl = `https://www.gravatar.com/avatar/${email}?d=monsterid`
		}

		console.log(user)
		return bcrypt.hash(user.password, HASH_ROUNDS).then((hashedPassword) => {
			console.log(user, 'this is the user going into the query')
			console.log(hashedPassword, 'the pw')
			return this.query(knex.insert({
				email: user.email,
				username: user.username,
				password: hashedPassword,
				firstName: user.firstName,
				lastName: user.lastName,
				language: user.language,
				avatarUrl: user.avatarUrl
			}).into('user').toString());
		}).then((result) => {
			console.log(result, 'this is first result')
			return this.query(knex.select(USER_FIELDS).from('user').where('id', result.insertId).toString());
		}).then(result => {
			console.log(result)
			return result[0]
		}).catch((error) => {
			if (error.code === 'ER_DUP_ENTRY') {
				return Promise.reject({error : { email : 'A user with this email already exists' }});
			} else {
				//console.log("ERROR line 68", error)
				return Promise.reject({error : { errorMessage : 'something went wrong' }});
			}
		});
	}

	deleteUser(userId) {
		return this.query(knex.delete().from('user').where('id', userId).toString());
	}

	getUserFromSession(sessionToken) {
		return this.query(knex.select(util.joinKeys('user', USER_FIELDS)).from('session').join('user', 'session.user_id', '=', 'user.id').where({'session.token': sessionToken}).toString()).then((result) => {
			console.log(result, 'the result')
			if (result.length === 1) {
				return result[0];
			}
			return null;
		});
	}

	createTokenFromCredentials(email, password) {
		const errors = validate.credentials({email: email, password: password});
		if (errors) {
			console.log(errors, 'there was an error')
			return Promise.reject({errors: errors});
		}


		let sessionToken;
		let user;
		return this.query(knex.select('id', 'password', 'language').from('user').where('email', email).toString()).then((queryResults) => {
			console.log(queryResults, "<<<<<<< FIRST QUERY RESULTS")
			if (queryResults.length === 1) {
				user = queryResults[0];
				console.log(password, user.password, 'after bcrypt compare query')
				return bcrypt.compare(password, user.password).catch(() => false);
			}
			return false;
		}).then((result) => {
			if (result === true) {
				var t = util.getRandomToken();
				return t;
			}
			return Promise.reject({error : { errorMessage : 'Username or password invalid' }});
		}).then((token) => {
			sessionToken = token;

			return this.query(knex.insert({user_id: user.id, token: sessionToken}).into('session').toString());
		}).then(() => {
			let authObj = {
				token: sessionToken,
				id: user.id,
				language: user.language
			}
			return authObj;
		});
	}

	deleteToken(token) {
		return this.query(knex.delete().from('session').where('token', token).toString()).then(() => true);
	}

	returnFullUserObject(user) {
		return this.query(knex.select(USER_FIELDS).from('user').where('id', user).toString()).then((result) => result).catch(err => res.json(err.message))
	}

	// MESSAGE FUNCTIONS ----------------------------------------------------------

	// create a new message
	createMessage(message) {
		return this.query(knex.insert(util.filterKeys(MESSAGE_FIELDS, message)).into('message').toString()).catch(error => console.log(error, 'Message instert into database went wrong'));
	}

	// message belongs to user
	messageBelongsToUser(messageId, userId) {
		console.log("line 167 messagebelongstoUser, messageid and User Id: ", messageId, userId)
		return this.query(knex.select('id').from('message').where({author: userId, id: messageId}).toString()).then((results) => {
			console.log(results, "are there results?")
			//this will be false if nothing is returned, an empty array
			if (results.length === 1) {
				return true;
			} else {
				throw new Error('Access denied');
			}
		});
	}

	// edit/update a message
	editMessage(messageId, messageObj) {
		console.log("line 188 edit message function", messageObj)
		return this.query(knex('message').update(util.filterKeys(MESSAGE_WRITE_FIELDS, messageObj)).where({id: messageId}).toString()).then(() => {
			return this.query(knex.select(MESSAGE_FIELDS).from('message').where('id', messageId).toString());
		});
	}

	// delete a message
	deleteMessage(messageId) {
		return this.query(knex.delete().from('message').where('id', messageId).toString()).then(() => true);
	}

	// CONVERSATION QUERIES -------------------------------------------------------

	createNewConversation(conversation) {
		return this.query(knex.insert(conversation).into('conversation').toString()).then((result) => {
			return this.query(knex.select(CONVERSATION_FIELDS).from('conversation').where('id', result.insertId).toString());
		}).then(result => {
			return result[0];
		}).catch((error) => {
			throw error;
		});
	}

	// update a conversation
	updateConversation(conversationId, conversation) {
		return this.query(knex('conversation').update(conversation).where({id: conversationId}).toString()).then(() => {
			return this.query(knex.select(CONVERSATION_FIELDS).from('conversation').where('id', conversationId).toString());
		});
	}

	// delete a conversation

	deleteConversation(conversationId) {
		console.log("trying to delete..")
		return this.query(knex.delete().from('conversation').where('id', conversationId).toString());
	}

	// get all conversations
	getAllConversations(user) {
		console.log(user, 'in conversations')
		var q = knex.select('*'). //CONVERSATION_FIELDS
		from('conversation').whereIn('id', function() {
			this.select('conversation_id').from('conversationuser').where('user_id', user)
		}).orWhere('admin', user).toString();
		console.log(q, '<<<<<<THE QUERY')
		return this.query(q);
	}

	// get a single conversation
	getSingleConversation(conversationId) {
		return this.query(knex.select(CONVERSATION_FIELDS).from('conversation').where('id', conversationId).toString())
	}

	getSingleConversationUser(conversationId) {
		console.log('in da fukin fucn baby')
		var u = knex.select("*"). //TODO don't select *
		from('conversationuser').join('user', 'user_id', 'user.id').where({'conversation_id': conversationId, 'date_left': null}).toString();
		return this.query(u);
	}

	getSingleConversationMessages(conversationId, user_id, order, limit) {
		console.log('in messages')
		var limit = typeof limit === 'undefined'
			? 200
			: limit;
		var m = knex.select("message.id", 'author', 'message_body', 'avatarUrl', 'username').from('message').join('user', 'user.id', '=', 'message.author').where('conversation_id', conversationId).orderBy('message.created_at', order).limit(limit).toString();
		return this.query(m).then(resp => {
			var promArray = new Array();
			resp.forEach(message => {
				var a = this.translateIt(message.message_body, user_id).then(trans => {
					message.message_body = trans.text
					return message;
				})
				promArray.push(a)
			})
			return Promise.all(promArray);
		}).catch((error) => {
			console.log("THIS IS THE ERROR", error)
			throw error;
		});

	}

	joinConversationAllUsers(conversation_id, user) {

		return this.query(knex.insert({conversation_id: conversation_id, user_id: user}).into('conversationuser').toString()).then((result) => {
			return true;
		}).catch((error) => {
			console.log("THIS IS THE ERROR", error)
			throw error;
		});
	}

	getAllUsersInConversation(conversation_id) {
		return this.query(
			knex
				.select('user_id', 'user.language', 'user.avatarUrl')
				.from('conversationuser')
				.join('user', 'user.id', 'conversationuser.user_id')
				.where('conversation_id', '=', conversation_id)
				.toString()
			)
			.then(result => {
				console.log(result, 'this is the result<<<<<<<<<<<<<<<<<<<<<<<<<')
				return result
			})
			.catch((error) => {
				console.log("THIS IS THE ERROR", error)
				throw error;
			});
	}

	// remove all users from conversation....
	removeAllUserFromConversation(conversation_id, users) {

		console.log()
		var q = knex('conversationUser').where({'conversation_id': conversation_id}).whereIn('user_id', users).update({
			'date_left': new Date().toISOString().slice(0, 19).replace('T', ' ')
		}).toString();

		console.log(q, "users array")
		return this.query(q).then((result) => {
			console.log(result)
			return true
		}).catch((error) => {
			throw error;
		});
	}

	messageReceived(message) {
		console.log(message, 'this is whats going into the db')
		return this.query(knex.insert({author: message.user, message_body: message.text, type: message.type, conversation_id: message.convoId}).into('message').toString()).catch((error) => {
			throw error;
		});
	}

	getUserLanguage(user_id) {
		return this.query(knex.select('language').from('user').where("id", user_id).toString()).catch((error) => {
			throw error;
		});
	}

	changeLanguage(user_id, newLang) {
		var q = this.query(knex('user')
		.where('id', user_id)
		.update({'language' : newLang})
		.toString());
		return q;
  }

	translateIt(text, user_id) {
		return this.getUserLanguage(user_id).then(userPref => {
			console.log(userPref, user_id, 'this is user obj')
			return translate(text, {to: userPref[0].language})
		}).then(translateResponse => {
			console.log(translateResponse, 'this is the response from translation')
			return translateResponse;
		})
	}
}

module.exports = Query;
